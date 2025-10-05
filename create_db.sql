USE [master];
GO

IF NOT EXISTS (SELECT * FROM sys.sql_logins WHERE name = 'admin')
BEGIN
    CREATE LOGIN [admin] WITH PASSWORD = 'Teste&&987!', CHECK_POLICY = OFF;
    ALTER SERVER ROLE [sysadmin] ADD MEMBER [admin];
END
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'SuporteDB')
BEGIN
    CREATE DATABASE [SuporteDB];
END;
GO
