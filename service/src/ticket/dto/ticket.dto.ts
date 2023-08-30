import { PartialType } from "@nestjs/swagger"

export class TicketCreateDto {
}

export class TicketUpdateDto extends PartialType(TicketCreateDto) {}