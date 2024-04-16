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

Create a local config.env file:

```bash
touch config.env
```

Add your MongoDB connection string to config.env:

```
MongoDBConnectionString="mongodb+srv://<DB_Username>:<DB_Password>@<DB_URL>/photo-storage-app?retryWrites=true&w=majority"
```

Ensure your MongoDB instance is running, then start the application:

```bash
npm start
```
