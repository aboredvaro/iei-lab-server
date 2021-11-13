-- BD Producción
CREATE DATABASE IF NOT EXISTS heroku_466c304cf70709d;
USE heroku_466c304cf70709d;


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
	id_biblioteca INT AUTO_INCREMENT,
	nombre VARCHAR(200) NOT NULL,
	tipo VARCHAR(200) NOT NULL,
	direccion VARCHAR(200) NOT NULL,
	codigoPostal INT NOT NULL,
	longitud DOUBLE NOT NULL,
	latitud DOUBLE NOT NULL,
	telefono INT NOT NULL,
	email VARCHAR(100) NOT NULL,
	descriptión VARCHAR(500) NOT NULL,
	PRIMARY KEY(id_biblioteca),
	FOREIGN KEY (codigoPostal) REFERENCES localidad (codigo)
);