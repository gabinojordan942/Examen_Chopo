
--******* CREACION DE bd Y tABLAS ****************************
CREATE DATABASE GestionTareas;
GO

USE GestionTareas;
GO

CREATE TABLE Usuario (
    IdUsuario INT IDENTITY(1,1) PRIMARY KEY,
    Nombre    NVARCHAR(100) NOT NULL,
    Email     NVARCHAR(150) NOT NULL UNIQUE
);
GO

CREATE TABLE Tarea (
    IdTarea          INT IDENTITY(1,1) PRIMARY KEY,
    IdUsuario        INT NOT NULL,
    Titulo           NVARCHAR(200) NOT NULL,
    FechaVencimiento DATE NULL,
    Estado           NVARCHAR(20) NOT NULL 
                      CONSTRAINT DF_Tarea_Estado DEFAULT ('Pendiente')
                      CONSTRAINT CK_Tarea_Estado CHECK (Estado IN ('Pendiente','En progreso','Completada','Cancelada')),
    CONSTRAINT FK_Tarea_Usuario FOREIGN KEY (IdUsuario)
        REFERENCES Usuario(IdUsuario)
        ON DELETE CASCADE
);
GO

-- ============================================
-- Índices
-- ============================================

-- FK: acelera JOINs, búsquedas por usuario y el ON DELETE CASCADE
CREATE INDEX IX_Tarea_IdUsuario 
ON Tarea(IdUsuario);
GO

-- Índice compuesto (covering) para el patrón más común:
-- "tareas de un usuario, filtradas por estado, ordenadas por vencimiento"
CREATE INDEX IX_Tarea_Usuario_Estado_Fecha 
ON Tarea(IdUsuario, Estado, FechaVencimiento)
INCLUDE (Titulo);
GO

-- Opcional: solo si consultas tareas por estado SIN filtrar por usuario
-- (ej. panel de administración con "todas las Pendientes")
CREATE INDEX IX_Tarea_Estado 
ON Tarea(Estado);
GO

-- Opcional: solo si consultas por vencimiento SIN filtrar por usuario
-- (ej. job nocturno que busca todas las tareas vencidas)
CREATE INDEX IX_Tarea_FechaVencimiento 
ON Tarea(FechaVencimiento);

--creacion de sp
USE GestionTareas;
GO

ALTER PROCEDURE sp_GestionTareas
    @Accion          NVARCHAR(10) = 'SELECT',   -- 'SELECT', 'INSERT', 'UPDATE', 'DELETE'
    @IdTarea         INT           = NULL,
    @IdUsuario       INT           = NULL,
    @Titulo          NVARCHAR(200) = NULL,
    @FechaVencimiento DATE         = NULL,
    @Estado          NVARCHAR(20)  = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- =========================================================
    -- SELECT: Reporte de pendientes/vencidas por usuario
    -- =========================================================
    IF @Accion = 'SELECT'
    BEGIN
        SELECT 
            u.IdUsuario,
            u.Nombre,
			u.Email,
            COUNT(t.IdTarea) AS TotalPendientes,
            SUM(CASE 
                    WHEN t.FechaVencimiento IS NOT NULL 
                         AND t.FechaVencimiento < CAST(GETDATE() AS DATE) 
                    THEN 1 
                    ELSE 0 
                END) AS TotalVencidas
        FROM Usuario u
        INNER JOIN Tarea t 
            ON t.IdUsuario = u.IdUsuario
            AND t.Estado = 'Pendiente'
        GROUP BY u.IdUsuario, u.Nombre,u.Email
        ORDER BY u.Nombre;
    END

    -- =========================================================
    -- INSERT: Crear nueva tarea
    -- =========================================================
    ELSE IF @Accion = 'INSERT'
    BEGIN
        IF @IdUsuario IS NULL OR @Titulo IS NULL
        BEGIN
            RAISERROR('IdUsuario y Titulo son obligatorios para insertar una tarea.', 16, 1);
            RETURN;
        END

        INSERT INTO Tarea (IdUsuario, Titulo, FechaVencimiento, Estado)
        VALUES (
            @IdUsuario, 
            @Titulo, 
            @FechaVencimiento, 
            ISNULL(@Estado, 'Pendiente')
        );

        SELECT CAST(SCOPE_IDENTITY() AS INT) AS IdTareaCreada;
    END

    -- =========================================================
    -- UPDATE: Actualizar tarea existente
    -- =========================================================
    ELSE IF @Accion = 'UPDATE'
    BEGIN
        IF @IdTarea IS NULL
        BEGIN
            RAISERROR('IdTarea es obligatorio para actualizar.', 16, 1);
            RETURN;
        END

        IF NOT EXISTS (SELECT 1 FROM Tarea WHERE IdTarea = @IdTarea)
        BEGIN
            RAISERROR('La tarea con el IdTarea especificado no existe.', 16, 1);
            RETURN;
        END

        UPDATE Tarea
        SET 
            Titulo           = ISNULL(@Titulo, Titulo),
            FechaVencimiento = ISNULL(@FechaVencimiento, FechaVencimiento),
            Estado           = ISNULL(@Estado, Estado),
            IdUsuario        = ISNULL(@IdUsuario, IdUsuario)
        WHERE IdTarea = @IdTarea;
    END

    -- =========================================================
    -- DELETE: Eliminar tarea
    -- =========================================================
    ELSE IF @Accion = 'DELETE'
    BEGIN
        IF @IdTarea IS NULL
        BEGIN
            RAISERROR('IdTarea es obligatorio para eliminar.', 16, 1);
            RETURN;
        END

        IF NOT EXISTS (SELECT 1 FROM Tarea WHERE IdTarea = @IdTarea)
        BEGIN
            RAISERROR('La tarea con el IdTarea especificado no existe.', 16, 1);
            RETURN;
        END

        DELETE FROM Tarea WHERE IdTarea = @IdTarea;
    END

    ELSE
    BEGIN
        RAISERROR('Accion no reconocida. Use SELECT, INSERT, UPDATE o DELETE.', 16, 1);
    END
END;
GO

---creacion de trigger 

USE GestionTareas;
GO

-- Tabla de auditoría
CREATE TABLE AuditoriaTarea (
    IdAuditoria     INT IDENTITY(1,1) PRIMARY KEY,
    IdTarea         INT NOT NULL,
    IdUsuario       INT NOT NULL,
    EstadoAnterior  NVARCHAR(20) NOT NULL,
    EstadoNuevo     NVARCHAR(20) NOT NULL,
    FechaCambio     DATETIME NOT NULL DEFAULT (GETDATE()),
    CONSTRAINT FK_AuditoriaTarea_Tarea FOREIGN KEY (IdTarea)
        REFERENCES Tarea(IdTarea)
);
GO

-- Trigger que registra el cambio de estatus
CREATE OR ALTER TRIGGER trg_Tarea_AuditEstado
ON Tarea
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Solo actuar si la columna Estado realmente cambió
    IF UPDATE(Estado)
    BEGIN
        INSERT INTO AuditoriaTarea (IdTarea, IdUsuario, EstadoAnterior, EstadoNuevo, FechaCambio)
        SELECT 
            i.IdTarea,
            i.IdUsuario,
            d.Estado AS EstadoAnterior,
            i.Estado AS EstadoNuevo,
            GETDATE()
        FROM inserted i
        INNER JOIN deleted d ON i.IdTarea = d.IdTarea
        WHERE i.Estado <> d.Estado;
    END
END;
GO