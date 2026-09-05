import uuid
import cloudinary
import cloudinary.uploader
from cloudinary import CloudinaryImage
from fastapi import UploadFile
from app.core.config import settings

cloudinary.config(
    cloud_name = settings.CLOUDINARY_CLOUD_NAME,
    api_key = settings.CLOUDINARY_API_KEY,
    api_secret = settings.CLOUDINARY_API_SECRET
)

async def upload_to_cloudinary(file: UploadFile, folder: str = "logos") -> dict:
    filename = file.filename or f"upload_{uuid.uuid4().hex[:4]}"
    name_without_ext = filename.rsplit(".", 1)[0]

    upload_result = cloudinary.uploader.upload(
        file.file,
        folder=f"sige/{folder}",
        public_id=f"{uuid.uuid4().hex[:8]}_{name_without_ext}",
        resource_type="image",
        overwrite=True
    )

    public_id = upload_result['public_id']
    optimized_url = CloudinaryImage(public_id).build_url(fetch_format="auto", quality="auto")

    return {
        "original_url": upload_result['secure_url'],
        "optimized_url": optimized_url,
        "public_id": public_id,
        "width": upload_result['width'],
        "height": upload_result['height'],
        "format": upload_result['format']
    }
