# 🎬 StreamHub — Gestión de contenido y usuarios en MongoDB (M4S3)

Proyecto de base de datos NoSQL con **MongoDB** que modela una plataforma de
streaming (StreamHub). Incluye modelado de colecciones, CRUD, operadores de
consulta, índices y agregaciones.

Esta guía está pensada para que **cualquier persona, desde cero**, pueda
instalar MongoDB, conectarse y ejecutar el script `streamhub.js`.

---

## 📑 Contenido del proyecto

| Archivo | Descripción |
|---|---|
| `streamhub.js` | Todos los comandos de MongoDB (inserciones, consultas, updates/deletes, índices y agregaciones). |
| `README.md` | Esta guía de instalación y uso. |
| `/mongoscreen` | [screenshots](screenshot.md) Evidencias de capturas tomadas desde MongoDB Compass. |


---

## 🧩 ¿Qué necesito instalar?

Para trabajar en local hacen falta **tres piezas**:

1. **MongoDB Community Server** → el motor (la base de datos que corre en tu PC).
2. **MongoDB Compass** → la interfaz visual (con botones) para ver los datos.
3. **mongosh** → la consola de comandos (viene incluida dentro de Compass).

> 💡 Compass y mongosh **no funcionan solos**: necesitan que el **Server** esté
> corriendo para tener a qué conectarse.

---

## 🖥️ INSTALACIÓN (Mac con chip Intel)

En Mac lo más limpio es instalar con **Homebrew** (gestor de programas por terminal).

### 1. Abrir la Terminal
`Cmd + Espacio` → escribir **Terminal** → Enter.

### 2. Instalar Homebrew (si no lo tienes)
Comprobar primero:
```bash
brew --version
```
Si dice "command not found", instálalo:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
> Te pedirá la contraseña del Mac (al escribirla no se ve, es normal). Si al
> final te pide copiar una línea con `eval "$(/usr/local/bin/brew shellenv)"`,
> pégala, dale Enter y reinicia la Terminal.

### 3. Instalar las Command Line Tools de Xcode
MongoDB las necesita para compilar. Si no las tienes:
```bash
xcode-select --install
```
Se abre una ventana → **Install** → esperar a que termine.

### 4. Instalar el motor de MongoDB
```bash
brew install mongodb-community
```

### 5. Encender el servidor MongoDB
```bash
brew services start mongodb-community
```
Verificar que quedó activo:
```bash
brew services list
```
Debe aparecer `mongodb-community` con estado **started**.

> Para apagarlo cuando quieras: `brew services stop mongodb-community`

### 6. Instalar MongoDB Compass (interfaz visual)
Descárgalo desde el sitio oficial (busca en Google: `MongoDB Compass download`),
abre el `.dmg` y arrástralo a Aplicaciones.

---

## 🪟 INSTALACIÓN (Windows) — alternativa

1. Buscar en Google: `MongoDB Community Server download` → descargar el `.msi`.
2. Instalar → elegir **Complete** → dejar marcado **"Install MongoD as a Service"**
   (así arranca solo con el sistema).
3. En el mismo instalador se ofrece Compass; puedes instalarlo ahí.
4. mongosh viene incluido dentro de Compass.

---

## 🔌 CONEXIÓN CON COMPASS

1. Abrir **MongoDB Compass**.
2. En **New Connection**, en el campo **URI**, pegar:
   ```
   mongodb://localhost:27017
   ```
3. Clic en **Save & Connect** (botón verde).
4. Si todo está bien, aparece **"Connected to localhost:27017"** y en el panel
   izquierdo se ven las bases de datos por defecto: **admin, config, local**.

> ❗ Si Compass no conecta, es porque el servidor no está corriendo.
> En Mac: `brew services start mongodb-community`.
> En Windows: abrir `services.msc` → **MongoDB Server** → Iniciar.

---

## ⌨️ USAR LA CONSOLA (mongosh dentro de Compass)

1. En el panel izquierdo, clic en la conexión **localhost:27017**.
2. En la parte **inferior** de la ventana, clic en la barra **`>_MONGOSH`**.
3. Se abre una consola negra donde se escriben los comandos.

También se puede usar la pestaña **mongosh** que aparece arriba tras conectar.

---

## ▶️ CÓMO EJECUTAR EL SCRIPT `streamhub.js`

### Opción A — Pegar bloque por bloque (recomendado para dummies)
1. Abrir la consola `>_MONGOSH`.
2. Copiar el **primer** comando del archivo (`use streamhub`) y Enter.
3. Ir copiando los demás bloques **uno a uno**, esperando la respuesta de cada
   uno antes de pegar el siguiente.

> ⚠️ **Importante:** pega un comando a la vez. Si pegas dos comandos juntos sin
> separación, mongosh puede dar `SyntaxError: Missing semicolon`.

>**Nota:** Se pueden crear las colecciones con el signo +  luego de que ya exista el streamhub por el comando (`use streamhub`)

### Opción B — Cargar el archivo completo (terminal externa)
Si tienes mongosh en la terminal del sistema, desde la carpeta del proyecto:
```bash
mongosh mongodb://localhost:27017 streamhub.js
```
Esto ejecuta todo el script de una sola vez.

---

## ⏱️ ORDEN RECOMENDADO DE EJECUCIÓN

El script está pensado para correrse en este orden:

1. `use streamhub` (crea/selecciona la base)
2. **TASK 2** — inserciones (poblar datos)
3. **TASK 3** — consultas con operadores
4. **Agregaciones** — las 2 pipelines
5. **TASK 5** — índices
6. **TASK 4** — updates y deletes (**al final**, porque borra datos que las
   agregaciones usan para verse completas)

---

## ✅ CÓMO VERIFICAR QUE FUNCIONÓ

Tras las inserciones, en el panel izquierdo de Compass (refrescando con 🔄)
debe aparecer la base **streamhub** con 3 colecciones:

- `usuarios`
- `contenidos`
- `valoraciones`

Para verlas por consola:
```javascript
show collections
db.usuarios.find()
db.contenidos.find()
db.valoraciones.find()
```

Cada inserción correcta responde con `acknowledged: true`.

---

## 📚 RESUMEN DEL MODELO DE DATOS

**usuarios**
```json
{ "nombre": "Ana", "email": "ana@mail.com", "contenidosVistos": 7, "historial": ["Matrix", "Friends"] }
```

**contenidos** (con documentos anidados en `reseñas`)
```json
{ "titulo": "Matrix", "tipo": "pelicula", "genero": "scifi", "duracion": 136, "calificacion": 8.5, "reseñas": [{ "usuario": "Ana", "puntos": 9 }] }
```

**valoraciones**
```json
{ "usuario": "Ana", "titulo": "Matrix", "puntos": 9, "fecha": "2024-01-10" }
```

---

## 🛠️ PROBLEMAS COMUNES

| Problema | Solución |
|---|---|
| Compass no conecta | El server no está corriendo → `brew services start mongodb-community` (Mac) o iniciar el servicio (Windows). |
| `SyntaxError: Missing semicolon` | Pegaste dos comandos juntos → pega uno a la vez. |
| No veo los datos en Compass | Refresca la colección con el ícono 🔄. |
| `mongodb-community cannot be installed from bottle` | Faltan las Command Line Tools → `xcode-select --install`. |
| No aparece la base `streamhub` | Se crea al insertar el primer documento; corre una inserción. |


---

**Autor:** Vanessa Fontalvo Reniz
**Módulo:** M4S3 — Gestión de contenido y usuarios en MongoDB
