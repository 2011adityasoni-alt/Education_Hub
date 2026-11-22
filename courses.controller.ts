import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators';
import { CoursesService } from './courses.service';
import { ListCoursesQueryDto } from './dto/list-courses.dto';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly courses: CoursesService) {}

  @Public() // the catalogue is browsable before login
  @Get()
  list(@Query() query: ListCoursesQueryDto) {
    return this.courses.listPublished(query);
  }
}
