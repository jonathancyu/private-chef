"""add instruction foreign key

Revision ID: 85f206e55748
Revises: 28c83c66dfe5
Create Date: 2025-04-02 21:00:24.113194

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "85f206e55748"
down_revision: Union[str, None] = "28c83c66dfe5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Use batch operations for SQLite compatibility
    with op.batch_alter_table("recipe_instruction") as batch_op:
        batch_op.add_column(
            sa.Column("recipe_id", sa.Integer(), nullable=False, server_default="1")
        )
        batch_op.create_foreign_key(
            "fk_recipe_instruction_recipe_id", "recipe", ["recipe_id"], ["id"]
        )
        # Remove the server_default after the column is created
        batch_op.alter_column("recipe_id", server_default=None)


def downgrade() -> None:
    """Downgrade schema."""
    # Use batch operations for SQLite compatibility
    with op.batch_alter_table("recipe_instruction") as batch_op:
        batch_op.drop_constraint("fk_recipe_instruction_recipe_id", type_="foreignkey")
        batch_op.drop_column("recipe_id")
