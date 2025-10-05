# Contributing

Thank you for investing time in Hipotrack! The guidelines below highlight the workflow for keeping Supabase types and the application schema in sync.

## Supabase type generation

1. **Install the Supabase CLI** if you haven't already. Follow the official instructions at <https://supabase.com/docs/reference/cli/installation>.
2. **Authenticate with Supabase** (`supabase login`) so that the CLI can access your project.
3. **Expose the project identifier** locally before generating types:
   ```bash
   export SUPABASE_PROJECT_ID=your_project_id
   ```
   For CI environments, add `SUPABASE_PROJECT_ID` to the job's secret environment variables so that automation can regenerate the types as part of checks.
4. **Regenerate the TypeScript types** whenever the database schema changes:
   ```bash
   npm run types:supabase
   ```
5. **Commit the generated file** (`src/types/supabase.ts`) together with any schema changes to keep reviewers and CI in sync.

## Development checklist

- Run the appropriate linting or build commands for the area you changed.
- Include tests or updates to Storybook stories when adding UI features.
- Reference this document when updating CI pipelines so type generation stays automated.
