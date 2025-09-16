#!/bin/bash

# Database initialization script
# This script runs when the PostgreSQL container is first created

set -e

echo "🏗️  Initializing WAFL AI POS System database..."

# Create additional databases if needed
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";

    -- Create application-specific functions
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS \$\$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    \$\$ language 'plpgsql';

    -- Log initialization completion
    SELECT 'WAFL Database initialized successfully' as status;
EOSQL

echo "✅ Database initialization completed!"