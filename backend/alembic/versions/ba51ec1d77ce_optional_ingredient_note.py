"""optional ingredient note

Revision ID: ba51ec1d77ce
Revises: 8f356cc28a29
Create Date: 2025-04-02 19:48:41.943857

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "ba51ec1d77ce"
down_revision: Union[str, None] = "8f356cc28a29"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # SQLite doesn't support ALTER COLUMN directly, so we need to use batch operations
    with op.batch_alter_table("recipe_ingredient") as batch_op:
        batch_op.alter_column("note", existing_type=sa.String(), nullable=True)


def downgrade() -> None:
    """Downgrade schema."""
    # Revert the change by making the note column non-nullable again
    with op.batch_alter_table("recipe_ingredient") as batch_op:
        batch_op.alter_column("note", existing_type=sa.String(), nullable=False)
