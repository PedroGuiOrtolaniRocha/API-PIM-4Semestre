USE SuporteDB;
GO

-- Criar dois usuários
INSERT INTO [User] (Username, Email, PasswordHash, Role) VALUES ('tecnico', 'tecnico@example.com', '4bc4d0a57621aafd6d829ce2e996d4655d4de64a73c46d7e987fb80c3b0b71c8', 'Technician');
INSERT INTO [User] (Username, Email, PasswordHash, Role) VALUES ('usuario', 'user@example.com', 'e1aa6533b72c63a26ebed8bbd778f5f50c88b83db6977546f00d7a1097689abb', 'User');
INSERT INTO [User] (Username, Email, PasswordHash, Role) VALUES ('admin', 'admin@example.com', 'b227bff0d28823d4599a39a5b55725b0811c9c13184087e9a122eb572e6ff139', 'Admin');

GO

-- Criar Spec
INSERT INTO Spec (Name, Description) VALUES ('ar condicionado', 'Destinado a resolver problemas de AC');
GO

-- Vincular o primeiro usuário ao Spec como TecRegister
INSERT INTO TecRegister (SpecId, UserId) VALUES (1, 1);
GO

-- Criar Ticket vinculado ao Spec, TecUserId = 1 (tecnico1), UserId = 2 (usuario2)
INSERT INTO Ticket (UserId, TecUserId, Description, Resolution, Title, Status, CreatedAt)
VALUES (2, NULL, 'Problema no ar condicionado', NULL, 'AC não liga', 'Aberto', GETDATE());
GO

-- Relacionar Ticket ao Spec
INSERT INTO TicketSpecRelation (SpecId, TicketId) VALUES (1, 1);
GO

