# Photo Sharing App

## Running the app

Install all dependencies:

```bash
npm i
```

Build the frontend:

```bash
npm run build
```

Create a local `config.env` file:

```bash
touch config.env
```

Add your MongoDB connection string and a JWT Secret to `config.env`. Your `config.env` similar to below:

```
MongoDBConnectionString="mongodb+srv://<DB_Username>:<DB_Password>@<DB_URL>/photo-storage-app?retryWrites=true&w=majority"
JWTSecret=SuperSecretPassword
```

Ensure your MongoDB instance is running, then start the application:

```bash
npm start
```
