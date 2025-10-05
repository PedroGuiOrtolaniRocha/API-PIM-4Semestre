USE SuporteDB;
GO

INSERT INTO [User] (Username, Email, PasswordHash, Role)
VALUES ('tecnico1', 'tecnico1@email.com', 'hash1', 'Tecnico');

INSERT INTO [User] (Username, Email, PasswordHash, Role)
VALUES ('usuario1', 'usuario1@email.com', 'hash2', 'Usuario');

INSERT INTO Spec (Name, Description)
VALUES ('ar condicionado', 'destinado a resolver problemas de AC');

DECLARE @SpecId INT = (SELECT TOP 1 Id FROM Spec WHERE Name = 'ar condicionado');
DECLARE @TecUserId INT = (SELECT TOP 1 Id FROM [User] WHERE Username = 'tecnico1');
DECLARE @UserId INT = (SELECT TOP 1 Id FROM [User] WHERE Username = 'usuario1');

INSERT INTO TecRegister (SpecId, UserId)
VALUES (@SpecId, @TecUserId);

INSERT INTO Ticket (UserId, TecUserId, Description, Title, Status, CreatedAt, Resolution)
VALUES (
    @UserId,
    @TecUserId,
    'Problema no ar condicionado da sala 101',
    'AC não está gelando',
    'Aberto',
    GETDATE(),
    NULL
);

DECLARE @TicketId INT = (SELECT TOP 1 Id FROM Ticket WHERE UserId = @UserId AND TecUserId = @TecUserId);
INSERT INTO TicketSpecRelation (SpecId, TicketId)
VALUES (@SpecId, @TicketId);

