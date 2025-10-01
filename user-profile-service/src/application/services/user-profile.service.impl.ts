import { UserProfileService } from "../ports/input/user-profile.service";
import { UserProfileRepository } from "../ports/output/user-profile.repository";
import { UserProfile } from "../../domain/entities/userprofile";

export class UserProfileServiceImpl implements UserProfileService {
    constructor(private readonly userProfileRepository: UserProfileRepository) { }

    async createUserProfile(uid: string, firstName: string, lastName: string, gender: string, profileCompleted: boolean, enableRecordatorios: boolean, notificationToken: string): Promise<UserProfile> {
        const userProfile = new UserProfile();
        userProfile.uid = uid;
        userProfile.firstName = firstName;
        userProfile.lastName = lastName;
        userProfile.gender = gender;
        userProfile.profileCompleted = profileCompleted;
        userProfile.enableRecordatorios = enableRecordatorios;
        userProfile.notificationToken = notificationToken;
        return this.userProfileRepository.create(userProfile);
    }
    async getUserProfileByUid(uid: string): Promise<UserProfile | null> {
        return this.userProfileRepository.findByUid(uid);
    }
    async updateUserProfile(uid: string, firstName?: string, lastName?: string, gender?: string, profileCompleted?: boolean, enableRecordatorios?: boolean, notificationToken?: string): Promise<UserProfile | null> {
        const userProfile = await this.userProfileRepository.findByUid(uid);
        if (!userProfile) {
            return null;
        }
        userProfile.firstName = firstName ?? userProfile.firstName;
        userProfile.lastName = lastName ?? userProfile.lastName;
        userProfile.gender = gender ?? userProfile.gender;
        userProfile.profileCompleted = profileCompleted ?? userProfile.profileCompleted;
        userProfile.enableRecordatorios = enableRecordatorios ?? userProfile.enableRecordatorios;
        userProfile.notificationToken = notificationToken ?? userProfile.notificationToken;
        return this.userProfileRepository.update(userProfile);
    }
    async deleteUserProfile(uid: string): Promise<void> {
        const userProfile = await this.userProfileRepository.findByUid(uid);
        if (userProfile) {
            await this.userProfileRepository.delete(userProfile.id);
        }
    }
}