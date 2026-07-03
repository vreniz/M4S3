/* ============================================================
   HISTORIA DE USUARIO M4S3
   Gestión de contenido y usuarios en MongoDB (StreamHub)
   Autor: Vane
   Descripción: Script con todos los comandos de MongoDB usados:
   inserciones, consultas, updates/deletes, índices y agregaciones.
   Cómo usar: pegar bloque por bloque en la consola >_MONGOSH de Compass.
   ============================================================ */


/* ============================================================
   PREPARACIÓN: seleccionar / crear la base de datos
   ============================================================ */
use streamhub


/* ============================================================
   TASK 1 - ANÁLISIS DEL DOMINIO Y DISEÑO DE DOCUMENTOS
   ------------------------------------------------------------
   Dominio: StreamHub (plataforma de streaming tipo Netflix).
   Colecciones definidas:

   1) usuarios       -> personas registradas en la plataforma
        - nombre           (string)
        - email            (string)
        - contenidosVistos (number)
        - historial        (array de strings)  <- arreglo

   2) contenidos     -> películas y series (contenido audiovisual)
        - titulo        (string)
        - tipo          (string: "pelicula" | "serie")
        - genero        (string)
        - duracion      (number, en minutos)
        - calificacion  (number)
        - reseñas       (array de documentos anidados) <- documento anidado
              { usuario: string, puntos: number }

   3) valoraciones   -> puntuación que un usuario da a un contenido
        - usuario  (string)
        - titulo   (string)
        - puntos   (number)
        - fecha    (string, formato YYYY-MM-DD)
   ============================================================ */


/* ============================================================
   TASK 2 - INSERCIÓN DE DATOS (insertOne / insertMany)
   ============================================================ */

// insertOne -> inserta un solo documento
db.usuarios.insertOne({ nombre: "Ana", email: "ana@mail.com", contenidosVistos: 7, historial: ["Matrix","Friends"] });

// insertMany -> inserta varios documentos de una sola vez
db.usuarios.insertMany([
  { nombre: "Luis", email: "luis@mail.com", contenidosVistos: 3, historial: ["Titanic"] },
  { nombre: "Sofia", email: "sofia@mail.com", contenidosVistos: 9, historial: ["Matrix","Dune"] }
]);

// contenidos: incluye variedad (películas con reseñas, serie, película sin reseñas)
db.contenidos.insertMany([
  { titulo: "Matrix", tipo: "pelicula", genero: "scifi", duracion: 136, calificacion: 8.5, reseñas: [{ usuario: "Ana", puntos: 9 }] },
  { titulo: "Titanic", tipo: "pelicula", genero: "drama", duracion: 195, calificacion: 7.9, reseñas: [] },
  { titulo: "Friends", tipo: "serie", genero: "comedia", duracion: 22, calificacion: 8.9, reseñas: [{ usuario: "Luis", puntos: 8 }] },
  { titulo: "Dune", tipo: "pelicula", genero: "scifi", duracion: 155, calificacion: 8.2, reseñas: [{ usuario: "Sofia", puntos: 9 }] }
]);

// valoraciones
db.valoraciones.insertMany([
  { usuario: "Ana", titulo: "Matrix", puntos: 9, fecha: "2024-01-10" },
  { usuario: "Luis", titulo: "Friends", puntos: 8, fecha: "2024-02-05" },
  { usuario: "Sofia", titulo: "Dune", puntos: 9, fecha: "2024-03-01" }
]);


/* ============================================================
   TASK 3 - CONSULTAS (LECTURA) CON OPERADORES
   Operadores usados: $gt, $lt, $eq, $in, $and, $or, $regex
   ============================================================ */

// $gt (mayor que) -> películas/series con duración mayor a 120 minutos
db.contenidos.find({ duracion: { $gt: 120 } });

// $lt (menor que) -> contenidos con duración menor a 60 minutos
db.contenidos.find({ duracion: { $lt: 60 } });

// $eq (igual a) -> contenidos cuyo género es exactamente "scifi"
db.contenidos.find({ genero: { $eq: "scifi" } });

// $in (dentro de una lista) -> contenidos de género scifi o drama
db.contenidos.find({ genero: { $in: ["scifi", "drama"] } });

// $and (cumple ambas condiciones) -> películas con calificación mayor a 8
db.contenidos.find({ $and: [ { tipo: "pelicula" }, { calificacion: { $gt: 8 } } ] });

// $or (cumple al menos una) -> género comedia O duración mayor a 180
db.contenidos.find({ $or: [ { genero: "comedia" }, { duracion: { $gt: 180 } } ] });

// $regex (coincidencia de texto) -> títulos que contengan "Mat" (i = ignora mayúsculas)
db.contenidos.find({ titulo: { $regex: "Mat", $options: "i" } });

// Ejemplo sugerido: usuarios que vieron más de 5 contenidos
db.usuarios.find({ contenidosVistos: { $gt: 5 } });


/* ============================================================
   TASK 4 - ACTUALIZACIONES Y ELIMINACIONES
   updateOne / updateMany / deleteOne / deleteMany
   ============================================================ */

// updateOne -> actualizar la calificación de un contenido específico
db.contenidos.updateOne(
  { titulo: "Matrix" },
  { $set: { calificacion: 9.0 } }
);

// updateMany -> marcar todas las películas como disponibles
db.contenidos.updateMany(
  { tipo: "pelicula" },
  { $set: { disponible: true } }
);

// deleteOne -> eliminar una valoración puntual
db.valoraciones.deleteOne({ usuario: "Luis" });

// deleteMany -> eliminar contenidos con calificación menor a 5 (limpieza)
db.contenidos.deleteMany({ calificacion: { $lt: 5 } });


/* ============================================================
   TASK 5 - ÍNDICES PARA PERFORMANCE
   createIndex / getIndexes
   ------------------------------------------------------------
   Justificación: se crean índices sobre "titulo" y "genero"
   porque son los campos que más se filtran en las consultas de
   TASK 3. Un índice evita que MongoDB recorra documento por
   documento (COLLSCAN) y permite búsquedas rápidas (IXSCAN),
   mejorando el rendimiento de las consultas frecuentes.
   ============================================================ */

// Índice ascendente sobre el título
db.contenidos.createIndex({ titulo: 1 });

// Índice ascendente sobre el género
db.contenidos.createIndex({ genero: 1 });

// Verificar los índices existentes de la colección
db.contenidos.getIndexes();


/* ============================================================
   AGREGACIONES (mínimo 2 pipelines)
   Etapas usadas: $match, $group, $sort, $project, $unwind
   ============================================================ */

// Agregación 1: calificación promedio y cantidad por género (solo películas)
// Métrica: ¿qué género de película tiene mejor calificación promedio?
db.contenidos.aggregate([
  { $match: { tipo: "pelicula" } },                                        // filtra películas
  { $group: { _id: "$genero", promedio: { $avg: "$calificacion" }, total: { $sum: 1 } } }, // agrupa por género
  { $sort: { promedio: -1 } }                                              // ordena de mayor a menor
]);

// Agregación 2: puntos promedio por título a partir de las reseñas anidadas
// Métrica: ranking de contenidos según los puntos de sus reseñas
db.contenidos.aggregate([
  { $unwind: "$reseñas" },                                                 // "abre" el arreglo de reseñas
  { $group: { _id: "$titulo", puntosPromedio: { $avg: "$reseñas.puntos" } } }, // agrupa por título
  { $project: { titulo: "$_id", puntosPromedio: 1, _id: 0 } },             // da forma al resultado
  { $sort: { puntosPromedio: -1 } }                                        // ordena de mayor a menor
]);


/* ============================================================
   FIN DEL SCRIPT
   ============================================================ */
