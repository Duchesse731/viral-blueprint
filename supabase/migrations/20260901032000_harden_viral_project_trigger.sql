-- Internal trigger functions are not browser-callable API endpoints.
revoke all on function public.viral_blueprint_projects_before_write() from public, anon, authenticated;
