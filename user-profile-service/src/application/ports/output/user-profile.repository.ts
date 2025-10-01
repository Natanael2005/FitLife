import { UserProfile } from "../../../domain/entities/userprofile";

export interface UserProfileRepository {
    create(userProfile: UserProfile): Promise<UserProfile>;
    findById(id: string): Promise<UserProfile | null>;
    findByUid(uid: string): Promise<UserProfile | null>;
    update(userProfile: UserProfile): Promise<UserProfile | null>;
    delete(id: string): Promise<void>;
}