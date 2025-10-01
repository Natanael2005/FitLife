import { UserProfileRepository } from "../../../application/ports/output/user-profile.repository";
import { UserProfile } from "../../../domain/entities/userprofile";
import { Repository } from "typeorm";

export class UserProfileRepositoryImpl implements UserProfileRepository {
    constructor(private readonly userProfileRepository: Repository<UserProfile>) { }

    async create(userProfile: UserProfile): Promise<UserProfile> {
        return this.userProfileRepository.save(userProfile);
    }

    async findById(id: string): Promise<UserProfile | null> {
        return this.userProfileRepository.findOneBy({ id });
    }

    async findByUid(uid: string): Promise<UserProfile | null> {
        return this.userProfileRepository.findOneBy({ uid });
    }

    async update(userProfile: UserProfile): Promise<UserProfile | null> {
        return this.userProfileRepository.save(userProfile);
    }

    async delete(id: string): Promise<void> {
        await this.userProfileRepository.delete(id);
    }
}