class UserController {
    constructor() {
        if(sessionStorage.getItem('totalUsers') == null){
            sessionStorage.setItem('totalUsers', 0)
        }
        this.currentID = sessionStorage.getItem('totalUsers');
    }

    //login validation
    validateLoginForm(event) {
        event.preventDefault();

        var username = document.getElementById("logUsername").value;
        var password = document.getElementById("logPassword").value;

        let users = JSON.parse(localStorage.getItem('users')) || [];
        for (let i = 0; i < users.length; i++) {
            if (users[i].username === username) {
                if(users[i].password === password){
                    //if match, set session id
                    sessionStorage.setItem('sessionID', users[i].id);
                    alert("Login successful!");
                    window.location.href = "?page=painting";
                    return;
                }
            }
        }

        alert("Failed to login!");
    }

    //function for generating user ids (looks how many are saved in localStorage + 1)
    generateID() {
        this.currentID++;
        sessionStorage.setItem('totalUsers', this.currentID)
        return this.currentID;
    }

    //validation for registration
    validateRegForm(event) {
        event.preventDefault();

        var username = document.getElementById("regUsername").value;
        var password = document.getElementById("regPassword").value;

        if (username.length < 6) {
            alert("Username must contain at least 6 characters");
            return;
        }

        let users = JSON.parse(localStorage.getItem('users')) || [];
        for (let i = 0; i < users.length; i++) {
            if (users[i].username === username) {
                alert("Registration was unsuccessful!");
                return;
            }
        }

        //if match save new user, set session ID
        var newUser = { id: this.generateID(), username: username, password: password };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        sessionStorage.setItem('sessionID', newUser.id);
        alert("Registration was successful!");
        window.location.href = "?page=painting";
    }

    //logout - removes session id
    logout() {
        sessionStorage.removeItem('sessionID');
    }
}

const userController = new UserController();
