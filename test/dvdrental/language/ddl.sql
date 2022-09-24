DROP TABLE IF EXISTS language;
CREATE TABLE language (
    id SERIAL PRIMARY KEY,
    name CHARACTER(20) NOT NULL,
    last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);