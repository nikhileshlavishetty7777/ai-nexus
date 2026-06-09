# backend/routes/documents.py
import asyncio
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from database.database import get_db
from database.models import User, Document
from models.schemas import DocumentResponse
from services.file_service import save_upload_file, create_document_record, process_document
from utils.dependencies import get_current_user
from typing import List

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    chat_id: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a document (PDF, TXT, DOCX)."""
    original_filename = file.filename or "document"
    file_size = 0

    try:
        filepath, file_type = await save_upload_file(file, current_user.id)

        # Get actual file size
        import os
        file_size = os.path.getsize(filepath)

        doc = create_document_record(
            db=db,
            user_id=current_user.id,
            original_filename=original_filename,
            filename=filepath.split("/")[-1],
            file_type=file_type,
            file_size=file_size,
            file_path=filepath,
            chat_id=chat_id,
        )

        # Process document in background
        asyncio.create_task(process_document(db, doc.id))

        return DocumentResponse.model_validate(doc)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("", response_model=List[DocumentResponse])
async def list_documents(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List user's uploaded documents."""
    docs = (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.created_at.desc())
        .offset(skip).limit(limit)
        .all()
    )
    return [DocumentResponse.model_validate(d) for d in docs]


@router.get("/{doc_id}", response_model=DocumentResponse)
async def get_document(
    doc_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get document details."""
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocumentResponse.model_validate(doc)


@router.delete("/{doc_id}")
async def delete_document(
    doc_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a document."""
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    import os
    try:
        os.remove(doc.file_path)
    except FileNotFoundError:
        pass

    db.delete(doc)
    db.commit()
    return {"message": "Document deleted"}
