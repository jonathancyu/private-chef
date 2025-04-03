"""remove name from ingredient

Revision ID: 8f356cc28a29
Revises: 9a637e1f9c3e
Create Date: 2025-04-02 19:44:55.247369

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8f356cc28a29'
down_revision: Union[str, None] = '9a637e1f9c3e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
