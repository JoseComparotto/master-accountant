import { Controller, Get, Redirect } from "@nestjs/common";

@Controller()
export class AppController {
  
  @Get()
  @Redirect('/docs', 301) // Redirects the root path (/) to /docs
  redirectToDocs() {}

  @Get('api')
  @Redirect('/docs', 301) // Redirects the /api path to /docs
  redirectToDocsFromApi() {}
}