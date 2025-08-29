CREATE TABLE targets (
   uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
   kind TEXT NOT NULL,
   refID UUID NOT NULL UNIQUE
);