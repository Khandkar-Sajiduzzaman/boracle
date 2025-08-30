CREATE TYPE decision AS ENUM ('pending', 'published', 'rejected');

CREATE TABLE moderatesReview (
    reviewID UUID NOT NULL,
    moderatorEmail TEXT NOT NULL,
    moderatedAt BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    comment text NOT NULL,
    decisionState decision NOT NULL,

    PRIMARY KEY (reviewID, moderatorEmail,moderatedAt),
    

    CONSTRAINT fk_review_ID
        FOREIGN KEY (reviewID) 
        REFERENCES reviews(reviewID) 
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_moderator_email
        FOREIGN KEY (moderatorEmail) 
        REFERENCES userinfo(email) 
        ON DELETE CASCADE
        ON UPDATE CASCADE
        
);