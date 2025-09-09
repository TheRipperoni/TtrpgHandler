# TTRPG Handler Development Guidelines

This document provides essential information for developers working on the TTRPG Handler project.

## Build and Configuration

### Environment Setup

The application requires several environment variables to function properly. Create a `.env` file in the project root with the following variables:

```
# Database Locations
FIREHOSE_SQLITE_LOCATION=path/to/firehose.sqlite
TTRPG_SQLITE_LOCATION=path/to/ttrpg.sqlite

# Bluesky/AT Protocol Configuration
FEEDGEN_SUBSCRIPTION_ENDPOINT="wss://bsky.network"
AGENT_PASSWORD=your_password_here

# Optional: Service DID (if different from did:web)
# FEEDGEN_SERVICE_DID="did:plc:abcde..."

# Performance Settings
FEEDGEN_SUBSCRIPTION_RECONNECT_DELAY=3000
CRAWL_DELAY=500

# Logging Configuration
OZONE_ENABLED=0
LOG_DESTINATION=logs/app.log
LOG_ENABLED=1
LOG_LEVEL=info
```

### Build Process

The project uses TypeScript and requires compilation before running:

```bash
# Install dependencies
yarn

# Build the project
yarn build
```

The compiled output will be in the `dist` directory.

### Running the Application

```bash
# Development mode (with ts-node)
yarn start

# Production mode (after building)
node dist/index.js
```

### Docker Deployment

The project includes Docker configuration for containerized deployment:

1. Build the Docker image:
   ```bash
   docker build -t ttrpg-handler .
   ```

2. Run with Docker Compose:
   ```bash
   docker-compose up -d
   ```

Note: The Docker setup expects environment variables to be provided through the `.env` file. The `.env` file is mounted into the container, not baked into the image.

### Database Migrations

The project uses Kysely for database migrations. To run migrations:

```bash
yarn migrate
```

This will apply all pending migrations to the TTRPG database.

## Testing

### Test Configuration

Tests use Jest as the testing framework. Test-specific environment variables can be set in `test.env`:

```
LOG_ENABLED=true
LOG_DESTINATION=test.log
```

### Running Tests

```bash
# Run all tests
yarn test

# Run specific test file
yarn test tests/path/to/test.js

# Run tests with coverage
yarn test --coverage
```

### Writing Tests

Tests are located in the `tests` directory. The project follows these testing patterns:

1. **Service Tests**: Test service-level functionality in isolation
    - Located in `tests/services/`
    - Example: `character-service.test.ts`

2. **Integration Tests**: Test interaction between components
    - Located in the root of the `tests` directory
    - Example: `event-handler.test.ts`

#### Test Structure Example

```typescript
import { SomeService } from '../src/services/some-service'
import { createTtrpgDb, migrateTtrpgToLatest, TtrpgDatabase } from '../src/db'

describe('Service Tests', () => {
  let db: TtrpgDatabase
  
  beforeAll(async () => {
    // Use in-memory database for tests
    db = createTtrpgDb(':memory:')
    await migrateTtrpgToLatest(db)
    
    // Set up test data
    // ...
  })
  
  beforeEach(() => {
    // Set up mocks or spies
    // ...
  })
  
  afterEach(() => {
    // Clean up mocks
    jest.restoreAllMocks()
  })
  
  it('should perform some action', async () => {
    // Arrange
    const service = new SomeService(db)
    const input = { /* ... */ }
    
    // Act
    const result = await service.someMethod(input)
    
    // Assert
    expect(result).toEqual(/* expected output */)
  })
})
```

### Mocking

The project uses Jest's mocking capabilities. Common patterns include:

1. **Function Mocks**:
   ```typescript
   const mockFunction = jest.spyOn(module, 'function').mockImplementation(() => mockReturn)
   ```

2. **Module Mocks**:
   ```typescript
   jest.mock('../path/to/module', () => ({
     function: jest.fn().mockReturnValue(mockValue)
   }))
   ```

## Code Structure and Conventions

### Project Organization

- `src/`: Source code
    - `db/`: Database-related code (schema, migrations)
    - `services/`: Business logic services
    - `util/`: Utility functions
    - `vo/`: Value objects (data structures)
    - `helpers/`: Helper functions for specific domains

### Key Components

1. **Database Layer**:
    - Uses Kysely for type-safe SQL queries
    - Schema defined in `src/db/schema.ts`
    - Migrations in `src/db/migrations.ts`

2. **Service Layer**:
    - Services handle business logic
    - Examples: `character-service.ts`, `adventure-service.ts`

3. **AT Protocol Integration**:
    - Agent configuration in `src/agent.ts`
    - Bluesky-specific functionality

### Logging

The application uses Pino for logging:

```typescript
import { logger } from './util/logger'

logger.info('Some message')
logger.error({ err }, 'Error occurred')
```

Configure logging behavior through environment variables:
- `LOG_ENABLED`: Enable/disable logging (true/false)
- `LOG_LEVEL`: Set log level (debug, info, warn, error)
- `LOG_DESTINATION`: Log file path (logs to console if not set)

## Debugging Tips

1. **Database Inspection**:
    - SQLite databases can be inspected with tools like SQLite Browser
    - Use `sqlite3` CLI for quick queries

2. **Logging**:
    - Set `LOG_LEVEL=debug` for verbose logging
    - Check log files for detailed operation information

3. **Common Issues**:
    - If the application fails to connect to Bluesky, check `AGENT_PASSWORD` and network connectivity
    - Database errors often relate to missing migrations or incorrect paths in environment variables