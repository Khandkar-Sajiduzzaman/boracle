CREATE TABLE askSectionID (
    swapID UUID NOT NULL,
    askSectionID INTEGER NOT NULL,

    PRIMARY KEY (swapID, askSectionID),
    CONSTRAINT fk_swapID
        FOREIGN KEY (swapID) 
        REFERENCES courseSwap(swapID) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);