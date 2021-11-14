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
	nombre VARCHAR(200),
	tipo VARCHAR(200) NOT NULL,
	direccion VARCHAR(200) NOT NULL,
	codigoPostal INT NOT NULL,
	codigoLocalidad INT NOT NULL,
	longitud DOUBLE NOT NULL,
	latitud DOUBLE NOT NULL,
	telefono INT,
	email VARCHAR(100) NOT NULL,
	descriptión VARCHAR(500),
	PRIMARY KEY(nombre),
	FOREIGN KEY (codigoPostal) REFERENCES localidad (codigo)
);