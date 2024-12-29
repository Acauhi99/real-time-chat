import { Exclude, Expose } from "class-transformer";

@Exclude()
export class DataUserResponseDto {
  @Expose()
  userId!: string;

  @Expose()
  email!: string;

  @Expose()
  name!: string;

  constructor(partial: Partial<DataUserResponseDto>) {
    Object.assign(this, partial);
  }
}
