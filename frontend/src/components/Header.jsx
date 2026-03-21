import Login from '../views/Login'
import Register from '../views/Register'
import Profile from '../views/Profile'


const Header = () => {
    return (
        <nav>
            <li><a href="/profile">Profile</a></li>
            <li><a href="/Login">Login</a></li>
            <li><a href="/Register">Register</a></li>
        </nav>
    )
}

export default Header;