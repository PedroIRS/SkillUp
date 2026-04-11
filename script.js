window.onload = main();

function main() {
    upNav();
}

async function upNav() {
    const verify = await verificar()
    if(verify) {
        document.getElementById("loginLink").style.display = "none"
        if(verify["isProfessor"]) {
            document.getElementById("perfilLink").style.display = "inline"
        } else {
            document.getElementById("perfilLink").style.display = "inline"
        }
    }
}

async function verificar() {
    const response = await fetch('http://127.0.0.1:8000/auth/me', {
    method: 'GET',
    credentials:"include",
    headers: {
        'Content-Type': 'application/json'
    }
    })
    const data = await response.json();
    
    if (response.status == 200) {
        return data
    } else if(response.status == 401 &&  ["Access token expirado", "Access token não encontrado"].includes(data["detail"])) {
        const refresh = await refreshToken();
        if(refresh) {
            return verificar()
        }
    }
}

async function refreshToken() {
    const response = await fetch('http://127.0.0.1:8000/auth/refresh', {
    method: 'GET',
    credentials:"include",
    headers: {
        'Content-Type': 'application/json'
    }
    })

    const data = await response.json();
    if(response.status == 401) {
        return false;
    } else {
        return true;
    }
}

async function login() {
    const email = document.getElementById("loginEmailInput").value;
    const senha = document.getElementById("loginSenhaInput").value;

    const response = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({
        "email": email,
        "senha": senha
        })
    });

    const data = await response.json();
    if (response.status == 200) {
        console.log(data, response.status)
        window.location.href = "/";
    } else if (response.status == 400 || response.status == 404) {
        document.getElementById("mensagemErro").style.display = "block";
    }
}


function validarInfos() {
    const nome = document.getElementById("signinNomeInput").value;
    const email = document.getElementById("signinEmailInput").value;
    const senha = document.getElementById("signinSenhaInput").value;
    const isProfessor = document.getElementById("isProfessor").checked;
    const confirmSenha = document.getElementById("confirmSigninSenha").value;

    if(senha.length >= 8) {
        if(!senha.includes(" ")) {
            if(senha == confirmSenha) {
                signin(nome, email, senha, isProfessor)
            } else {
                document.getElementById("mensagemErro").style.display = "block";
                document.getElementById("mensagemErro").textContent = "As senhas não coincidem";
            }

        } else {
            document.getElementById("mensagemErro").style.display = "block";
            document.getElementById("mensagemErro").textContent = "A senha não pode ter espaços";
        }

    } else {
        document.getElementById("mensagemErro").style.display = "block";
        document.getElementById("mensagemErro").textContent = "A senha deve ter 8 dígitos";
    }
}


async function signin(nome, email, senha, isProfessor) {
    const response = await fetch("http://127.0.0.1:8000/auth/signin", {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({
        "nome": nome,
        "email": email,
        "senha": senha,
        "isProfessor": isProfessor
        })
    });

    const data = await response.json();
    console.log(data)
    if(response.status == 400) {
        document.getElementById("mensagemErro").style.display = "block";
        document.getElementById("mensagemErro").textContent = "O e-mail já está cadastrado";
    }
}


async function getInfos(idUser) {
    const response = await fetch(`http://127.0.0.1:8000/profile/getinfo/${idUser}`, {
        method: 'GET',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        }
    })
    
    const data = await response.json()
    if(response.status == 200) {
        document.getElementById("nomeUser").textContent = data["nome"];
        document.getElementById("desc").textContent = data["desc"];
        document.getElementById("pontos").textContent = data["pontos"];
        document.getElementById("posicaoRanking").textContent = data["posicaoRanking"];
        document.getElementById("desafiosCompletos").textContent = data["desafiosCompletos"];
        document.getElementById("ofensiva").textContent = data["ofensiva"];
        document.getElementById("horas").textContent = data["horasJogadas"];
        document.getElementById("conquistas").textContent = data["numConquistas"];
        document.getElementById("nivel").textContent = `Nivel ${data["nivel"]}`
        document.getElementById("progressNivel").textContent = `Progresso para o nivel ${data["nivel"] + 1}`
        document.getElementById("progressoXp").textContent = `${data["xp"]} / ${Math.floor(100 * (1.5 ** data["nivel"]))} xp`
        document.getElementById("xpAtual").style.width = `${(data["xp"] * 100) / (100 * (1.5 ** data["nivel"]))}%`
    } else {
        alert("Usuário não encontrado")
        window.location.href = "/"
    }
}

async function editarPerfil() {
    const nome = document.getElementById("editarNome").value;
    const desc = document.getElementById("editarDesc").value;

    if(desc.length <= 150) {
        const response = await fetch("http://127.0.0.1:8000/profile/editarPerfil", {
            method: "PATCH",
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
            "nome": nome,
            "desc": desc
            })
        })

        const data = await response.json()
        if(response.status == 200) {
            document.getElementById("editarPerfil").style.display = "block"
            document.getElementById("confirmEdicao").style.display = "none"
            document.getElementById("nomeUser").style.display = "block"
            document.getElementById("editarNome").style.display = "none"
            document.getElementById("desc").style.display = "block"
            document.getElementById("editarDesc").style.display = "none"
            window.location.reload()
        } else if(response.status == 401 && ["Access token expirado", "Access token não encontrado"].includes(data["detail"])) {
            const refresh = await refreshToken()
            if(refresh) {
                editarPerfil()
            }
        }
    } else {
        alert("A descrição deve ter no  máximo 150 caracteres")
    }
}

async function atualizarRanking() {
    const response = await fetch("http://127.0.0.1:8000/profile/atualizarRanking", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
    })

    const data = await response.json()
    console.log(data)
}

async function getUserConquistas(idUser) {
    const response = await fetch(`http://127.0.0.1:8000/profile/getUserConquistas/${idUser}`, {
        method: "GET",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
    })
    const data = await response.json()
    return data
}

async function atualizarConquistas() {
    const response = await fetch("http://127.0.0.1:8000/profile/atualizarConquistas", {
        method: "POST",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
    })
}

async function conquistas() {
    const response = await fetch("http://127.0.0.1:8000/profile/conquistas", {
        method: "GET",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
    })
    const data = await response.json()
    console.log(data)
    return data
}

async function conquistasList(idUser) {
    const conquistasContent = document.getElementById("conquistasContent")
    const userConquistas = await getUserConquistas(idUser)
    const conquistaList = await conquistas()
    
    for (let i = 0; i < conquistaList.length; i++) {
        const conquista = conquistaList[i];
        let possui = 0
        for (let i = 0; i < userConquistas.length; i++) {
            const userConquista = userConquistas[i];
            if (userConquista["idConquista"] == conquista["id"] && userConquista["possui"]) {
                possui = 1
            }
        }
        if (possui == 1) {
            const div = document.createElement("div")
            div.classList.add("conquistaTrue")
            div.textContent = conquista["desc"]
            conquistasContent.appendChild(div)
        } else {
            const div = document.createElement("div")
            div.classList.add("conquistaFalse")
            div.textContent = conquista["desc"]
            conquistasContent.appendChild(div)
        }
    }
}

async function getRanking() {
    const response = await fetch("http://127.0.0.1:8000/profile/getRanking", {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        },
    })

    const data = await response.json()
    return data
}


async function organizarRanking(espaco, num) {
    const rank = await getRanking()
    const rankingGeral = document.getElementById(espaco)
    console.log(rank)

    if(num == "ranking") {
        document.getElementById("numParticipantes").textContent = Object.keys(rank).length
        const verify = await verificar()
        if (verify) {
            const response = await fetch(`http://127.0.0.1:8000/profile/getinfo/${verify["id"]}`, {
            method: 'GET',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
                }
            })
    
            const data = await response.json()
            document.getElementById("userPosicao").textContent = data["posicaoRanking"]
            document.getElementById("userOfensiva").textContent = data["ofensiva"]
        }

        for (let i in rank) {
            const div = document.createElement("div")
            div.classList.add("rankingGeralContent")

            const pos = document.createElement("h4")
            pos.textContent = i
            pos.style.color = "#8FA3AD"

            const h4 = document.createElement("h4")
            h4.textContent = rank[i]["nome"]
            h4.style.cursor = "pointer"
            h4.onclick = function() {window.location.href = `./perfil.html?id=${rank[i]["idUser"]}`}
            
            const p = document.createElement("p")
            p.textContent = `${rank[i]["pontos"]} pts`

            if (i==1) {
                div.style.backgroundColor = "#2A2410"
                div.style.border = "solid 0.1rem #F2C94C"
                div.style.borderRadius = "0.8rem"

                document.getElementById("lugar1Nome").textContent = rank[i]["nome"]
                document.getElementById("lugar1Pts").textContent = `${rank[i]["pontos"]} \n pts`
            } else if (i==2) {
                div.style.backgroundColor = "#1E2428"
                div.style.border = "solid 0.1rem #C0C7CF"
                div.style.borderRadius = "0.8rem"

                document.getElementById("lugar2Nome").textContent = rank[i]["nome"]
                document.getElementById("lugar2Pts").textContent = `${rank[i]["pontos"]} \n pts`
            } else if (i==3) {
                div.style.backgroundColor = "#2A1F17"
                div.style.border = "solid 0.1rem #CD7F32"
                div.style.borderRadius = "0.8rem"

                document.getElementById("lugar3Nome").textContent = rank[i]["nome"]
                document.getElementById("lugar3Pts").textContent = `${rank[i]["pontos"]} \n pts`
            }

            div.append(pos)
            div.appendChild(h4)
            div.appendChild(p)
            rankingGeral.appendChild(div)
        }
    } else {
        let count = 0
        for (let i in rank) {
            if(count >= num) break

            const div = document.createElement("div")
            div.classList.add("rankingGeralContent")

            const pos = document.createElement("h4")
            pos.textContent = i
            pos.style.color = "#8FA3AD"

            const h4 = document.createElement("h4")
            h4.textContent = rank[i]["nome"]
            h4.style.cursor = "pointer"
            h4.onclick = function() {window.location.href = `./perfil.html?id=${rank[i]["idUser"]}`}

            const p = document.createElement("p")
            p.textContent = `${rank[i]["pontos"]} pts`

            if (i==1) {
                div.style.backgroundColor = "#2A2410"
                div.style.border = "solid 0.1rem #F2C94C"
                div.style.borderRadius = "0.8rem"
            } else if (i==2) {
                div.style.backgroundColor = "#1E2428"
                div.style.border = "solid 0.1rem #C0C7CF"
                div.style.borderRadius = "0.8rem"
            } else if (i==3) {
                div.style.backgroundColor = "#2A1F17"
                div.style.border = "solid 0.1rem #CD7F32"
                div.style.borderRadius = "0.8rem"
            }

            div.append(pos)
            div.appendChild(h4)
            div.appendChild(p)
            rankingGeral.appendChild(div)
            
            count++
        }
    }
}

async function editarSenha() {
    const senha = document.getElementById("senhaAtual").value;
    const novaSenha = document.getElementById("novaSenha").value;
    const confirmNovaSenha = document.getElementById("confirmNovaSenha").value;

    if(novaSenha == confirmNovaSenha) {
        const response = await fetch("http://127.0.0.1:8000/auth/editarSenha", {
            method: "PATCH",
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "senhaAtual": senha,
                "novaSenha": novaSenha
            })
        })
        const data = await response.json()

        if(response.status == 200) {
            document.getElementById("menssagemErro").style.display = "none"
        } else if(response.status == 401 && ["Access token expirado", "Access token não encontrado"].includes(data["detail"])) {
            const refresh = await refreshToken()
            if(refresh) {
                editarSenha()
            }
        } else if(response.status == 401 && data["detail"] == "Senha incorreta") {
            document.getElementById("menssagemErro").style.display = "block"
            document.getElementById("menssagemErro").textContent = "Senha incorreta"
        }

    } else {
        document.getElementById("menssagemErro").style.display = "block"
        document.getElementById("menssagemErro").textContent = "As senhas não coincidem"
    }

}


async function editarNome() {
    const novoNome = document.getElementById("infosNome").value;

    const response = await fetch("http://127.0.0.1:8000/auth/editarNome", {
        method: "PATCH",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "novoNome": novoNome
        })
    })
    const data = await response.json()
    console.log(data)

    if(response.status == 200) {
        window.location.reload()
    } else if(response.status == 401 && ["Access token expirado", "Access token não encontrado"].includes(data["detail"])) {
        const refresh = await refreshToken()
        if(refresh) {
            editarNome()
        }
    }
}



async function logout() {
    const response = await fetch("http://127.0.0.1:8000/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
    })
    const data = await response.json()

    if(response.status == 200) {
        window.location.href = "/"
        console.log(data, response.status)
    } else if(response.status == 401 && ["Access token expirado", "Access token não encontrado"].includes(data["detail"])) {
        const refresh = await refreshToken()
        if(refresh) {
            logout()
        }
    }
}


async function deletarConta() {
    const response = await fetch("http://127.0.0.1:8000/auth/deletarConta", {
        method: "DELETE",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
    })
    const data = await response.json()

    if(response.status == 200) {
        window.location.href = "/"
        console.log(data, response.status)
    } else if(response.status == 401 && ["Access token expirado", "Access token não encontrado"].includes(data["detail"])) {
        const refresh = await refreshToken()
        if(refresh) {
            deletarConta()
        }
    }
}

