USE SuporteDB;
GO

-- Criar dois usuários
INSERT INTO [User] (Username, Email, PasswordHash, Role) VALUES ('tecnico1', 'tec1@email.com', 'hash1', 'Tecnico');
INSERT INTO [User] (Username, Email, PasswordHash, Role) VALUES ('usuario2', 'user2@email.com', 'hash2', 'Usuario');
GO

-- Criar Spec
INSERT INTO Spec (Name, Description) VALUES ('ar condicionado', 'Destinado a resolver problemas de AC');
GO

-- Vincular o primeiro usuário ao Spec como TecRegister
INSERT INTO TecRegister (SpecId, UserId) VALUES (1, 1);
GO

-- Criar Ticket vinculado ao Spec, TecUserId = 1 (tecnico1), UserId = 2 (usuario2)
INSERT INTO Ticket (UserId, TecUserId, Description, Resolution, Title, Status, CreatedAt)
VALUES (2, 1, 'Problema no ar condicionado', NULL, 'AC não liga', 'Aberto', GETDATE());
GO

-- Relacionar Ticket ao Spec
INSERT INTO TicketSpecRelation (SpecId, TicketId) VALUES (1, 1);
GO

