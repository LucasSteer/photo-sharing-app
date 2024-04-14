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

Set the environment variable for the connection string to your MongoDB instance:

```bash
export MongoDBConnectionString="mongodb+srv://<DB_Username>:<DB_Password>@<DB_URL>/?retryWrites=true&w=majority"
```

Ensure your MongoDB instance is running, then start the application:

```bash
npm start
```
