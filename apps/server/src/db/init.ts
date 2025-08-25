import { Role } from "../models/role"
import { User } from "../models/user";
import { roleDefaults, Roles } from "../schema/roles"

const initializeRoles = async () => {
    for(const roleName of [Roles.ADMIN, Roles.USER]) {
        let role = await Role.findOne({ name: roleName });
        const defaultPerms = roleDefaults[roleName].permissions;
        if(!role) {
            role = new Role(roleDefaults[roleName])
        } else {
            role.permissions = role.permissions;
            for(let permType of Object.keys(defaultPerms)) {
                role.permissions[permType] = defaultPerms[permType]
            }
        }

        await role.save();
    }
}

const initializeUsers = async () => {
    const mockedUsers = [{name: 'senthil', role: Roles.ADMIN}, {name: 'arjun', role: Roles.USER}];
    for(const mockedUser of mockedUsers) {
        const user = await User.findOne({ name: mockedUser.name });
        if(!user) {
            const role = await Role.findOne({ name: mockedUser.role });
            await new User({name: mockedUser.name, role: role._id}).save();
        }
    }
}
export { initializeRoles, initializeUsers }