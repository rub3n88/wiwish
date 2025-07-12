-- Crear tabla session para connect-pg-simple
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

-- Agregar constraint de primary key si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'session_pkey') THEN
        ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid");
    END IF;
END $$;

-- Crear índice en expire si no existe
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
