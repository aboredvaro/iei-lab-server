-- BD Producción
-- CREATE DATABASE IF NOT EXISTS heroku_8710917fecf1cf0;
-- USE heroku_8710917fecf1cf0;

-- BD Beta
 CREATE DATABASE IF NOT EXISTS heroku_314befdd836197e;
 USE heroku_314befdd836197e;

-- Roles que pueden tener cada Entity
CREATE TABLE rol (
    id_role TINYINT AUTO_INCREMENT,
    name VARCHAR(10) NOT NULL,
    PRIMARY KEY(id_role)
);

-- Etiquetas que describen cada Entity y Activity
CREATE TABLE tags (
	id_tags INT AUTO_INCREMENT,
	name VARCHAR(20) NOT NULL,
	PRIMARY KEY (id_tags)
);

-- Imágenes guardadas en la BD
CREATE TABLE images (
    id_image INT AUTO_INCREMENT,
    urlPath TEXT,
    PRIMARY KEY (id_image)
);

-- Tabla de provincias, está siempre rellena y se consulta por los dos primeros dígitos del CP
CREATE TABLE provinces (
    id_province INT AUTO_INCREMENT,
    province VARCHAR(40) NOT NULL,
    PRIMARY KEY (id_province)
);

-- Tabla de direcciones, también contendrá las coordenadas para poder calcular la ruta
CREATE TABLE address (
    id_address INT AUTO_INCREMENT,
    id_province INT NOT NULL,
    codPos INT(5) NOT NULL,
    location VARCHAR (120) NOT NULL,
    direction VARCHAR (300) NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    PRIMARY KEY (id_address),
    FOREIGN KEY (id_province) REFERENCES provinces (id_province)
);

-- Entidades, son tanto participantes como creadores de contenidos.
-- También son establecimientos que ofertan sus actividades (se distinguen por el role)
CREATE TABLE entity (
    id_entity INT AUTO_INCREMENT,
    id_role TINYINT NOT NULL,
    id_address INT NOT NULL,
    nick VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(30) NOT NULL,
    surname VARCHAR(120),
    description VARCHAR(500) NOT NULL,
    mail VARCHAR(120) NOT NULL,
    sha256 VARCHAR(64) NOT NULL,
    pass VARCHAR(64) NOT NULL,
    phone INT NOT NULL, 
    avatar LONGTEXT NOT NULL,
    deleted BOOLEAN NOT NULL DEFAULT 0,
    PRIMARY KEY (id_entity),
    FOREIGN KEY (id_role) REFERENCES rol (id_role),
    FOREIGN KEY (id_address) REFERENCES address (id_address)
);

-- Actividades ofertadas, hace alusión a las actividades que se ofertan, que son las
-- mismas a las que entities se apuntan para participar
CREATE TABLE activity (
    id_activity INT AUTO_INCREMENT,
    id_entity_creator INT NOT NULL,
    id_address INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(500) NOT NULL,
    seats INT NOT NULL,
    price DOUBLE NOT NULL,
    dateAct DATE NOT NULL,
    min_duration INT NOT NULL,
    deleted BOOLEAN NOT NULL DEFAULT 0,
    PRIMARY KEY(id_activity),
    FOREIGN KEY (id_entity_creator) REFERENCES entity (id_entity),
    FOREIGN KEY (id_address) REFERENCES address (id_address)
);

-- Imágenes relacionadas con actividad
CREATE TABLE img_act (
    id_image INT,
    id_activity INT,
    deleted BOOLEAN NOT NULL DEFAULT 0,
	PRIMARY KEY (id_image, id_activity),
	FOREIGN KEY (id_image) REFERENCES images (id_image),
	FOREIGN KEY (id_activity) REFERENCES activity (id_activity)
);

-- Comentarios asociados a cada Actividad
CREATE TABLE review (
    id_review INT AUTO_INCREMENT,
    id_activity INT NOT NULL,
    id_entity INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    points TINYINT(1) NOT NULL,         -- Puntuación del 0 al 9
    deleted BOOLEAN NOT NULL DEFAULT 0,
    PRIMARY KEY(id_review),
    FOREIGN KEY (id_activity) REFERENCES activity (id_activity),
    FOREIGN KEY (id_entity) REFERENCES entity (id_entity)
);

-- Imágenes relacionadas con actividad
CREATE TABLE img_review (
    id_image INT,
    id_review INT,
    deleted BOOLEAN NOT NULL DEFAULT 0,
	PRIMARY KEY (id_image, id_review),
	FOREIGN KEY (id_image) REFERENCES images (id_image),
	FOREIGN KEY (id_review) REFERENCES review (id_review)
);
-- Listado de participantes que hay apuntados en una actividad
CREATE TABLE entityToActivity (
	id_entity INT NOT NULL,
    id_activity INT NOT NULL,
	FOREIGN KEY (id_entity) REFERENCES entity (id_entity),
	FOREIGN KEY (id_activity) REFERENCES activity (id_activity)
);

-- Listado de Etiquetas que tiene una Entidad, es decir
-- Los gustos a los que les gustaría suscribirse
CREATE TABLE tags_ent (
	id_entity INT,
    id_tags INT,
	PRIMARY KEY (id_tags, id_entity),
	FOREIGN KEY (id_tags) REFERENCES tags (id_tags),
	FOREIGN KEY (id_entity) REFERENCES entity (id_entity)
);

-- Listado de Etiquetas que tiene una Actividad, es decir
-- Los gustos que los identifica ante una Entidad
CREATE TABLE tags_act (
	id_activity INT,
    id_tags INT,
	PRIMARY KEY (id_tags, id_activity),
	FOREIGN KEY (id_tags) REFERENCES tags (id_tags),
	FOREIGN KEY (id_activity) REFERENCES activity (id_activity)
);