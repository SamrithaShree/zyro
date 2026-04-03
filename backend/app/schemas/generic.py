from pydantic import BaseModel
from typing import Any, Optional

class GenericResponse(BaseModel):
    status: str = "SUCCESS" # SUCCESS, ERROR
    message: str
    data: Optional[Any] = None
