CREATE TABLE votes (
   uEmail TEXT NOT NULL,
   targetUUID UUID NOT NULL,
   value INTEGER NOT NULL,
   createdAt BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
   PRIMARY KEY (uEmail, targetUUID),
   
   -- Foreign key constraints
   CONSTRAINT fk_user_email_vote
       FOREIGN KEY (uEmail) 
       REFERENCES userinfo(email) 
       ON DELETE CASCADE
       ON UPDATE CASCADE,
       
   CONSTRAINT fk_target_uuid
       FOREIGN KEY (targetUUID) 
       REFERENCES targets(uuid) 
       ON DELETE CASCADE
       ON UPDATE CASCADE,
   
   -- Check constraint for vote value
   CONSTRAINT valid_vote_value
       CHECK (value IN (1, -1))
);