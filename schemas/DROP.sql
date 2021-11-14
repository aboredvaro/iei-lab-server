-- BD Producción
USE heroku_466c304cf70709d;

DROP TABLE biblioteca;
DROP TABLE localidad;
DROP TABLE provincia;

CREATE TABLE provincia (
	codigo INT,
	nombre VARCHAR(100) NOT NULL,
	PRIMARY KEY(codigo)
);

CREATE TABLE localidad (
	codigo INT,
	nombre VARCHAR(100) NOT NULL,
	codigoProvincia INT NOT NULL,
	PRIMARY KEY(codigo),
	FOREIGN KEY (codigoProvincia) REFERENCES provincia (codigo)
);

CREATE TABLE biblioteca (
	id INT AUTO_INCREMENT,
	nombre VARCHAR(200),
	tipo VARCHAR(200) NOT NULL,
	direccion VARCHAR(200) NOT NULL,
	codigoPostal INT NOT NULL,
	codigoLocalidad INT NOT NULL,
	longitud DOUBLE NOT NULL,
	latitud DOUBLE NOT NULL,
	telefono INT,
	email VARCHAR(100) NOT NULL,
	descripcion VARCHAR(500),
	PRIMARY KEY(id),
	FOREIGN KEY (codigoPostal) REFERENCES localidad (codigo)
);