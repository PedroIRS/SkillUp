upNav()


async function upNav() {
    const verify = await verificar()
    if(verify) {
        document.getElementById("loginLink").style.display = "none"
        if(verify["isProfessor"]) {
            document.getElementById("perfilLink").style.display = "none"
            document.getElementById("botaoComece").style.display = "none"
            document.getElementById("gerenciaTurmasBotao").style.display = "block"
        } else {
            document.getElementById("perfilLink").style.display = "inline"
            document.getElementById("botaoComece").style.display = "block"
            document.getElementById("gerenciaTurmasBotao").style.display = "none"
        }
    }
}

function showNav() {
    const navLinks = document.querySelector(".navLinks")

    if (navLinks.style.display === "none") {
        navLinks.style.display = "flex"
    } else {
        navLinks.style.display = "none"
    }
}


function criarNotification(type, men) {
    const location = document.querySelector(".toastNotificationContent")

    const div = document.createElement("div")
    
    div.classList.add("toastNotification", "spawn")
    div.innerHTML = `
        <h3>${type}</h3>
        <p>${men}</p>
    `

    location.appendChild(div)
    setTimeout(() => {div.remove()}, 5000)
    
    if(type == "Sucesso") {
        div.style.borderColor = "#18E0B5"
        div.querySelector("h3").style.color = "#18E0B5"
    } else if(type == "Erro") {
        div.style.borderColor = "#FF4D4D"
        div.querySelector("h3").style.color = "#FF4D4D"
    } else if(type == "Informação") {
        div.style.borderColor = "#33B3FF"
        div.querySelector("h3").style.color = "#33B3FF"
    } else if(type == "Aviso") {
        div.style.borderColor = "#FFD93D"
        div.querySelector("h3").style.color = "#FFD93D"
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const noticacoes = JSON.parse(localStorage.getItem("notificacoes"))
    for(let i in noticacoes) {
        noticacoes[i].forEach((e) => {
            criarNotification(i, e)
            noticacoes[i].shift()
        })
    }
    localStorage.setItem("notificacoes", JSON.stringify(noticacoes))
})


async function verificar() {
    const response = await fetch('https://skillup-api-qxon.onrender.com/auth/me', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${localStorage.getItem("access-token")}`
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
    const response = await fetch('https://skillup-api-qxon.onrender.com/auth/refresh', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${localStorage.getItem("refresh-token")}`
    }
    })

    const data = await response.json();
    if(response.status == 401) {
        return false;
    } else {
        return true;
    }
}

async function login(email=document.getElementById("loginEmailInput").value, senha=document.getElementById("loginSenhaInput").value) {
    const response = await fetch("https://skillup-api-qxon.onrender.com/auth/login", {
        method: "POST",
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
        localStorage.setItem("refresh-token", data["refresh-token"])
        localStorage.setItem("access-token", data["access-token"])
        window.location.href = "./";
        const noticacoes = JSON.parse(localStorage.getItem("notificacoes")) || {"Sucesso": [], "Erro": [], "Informação": [], "Aviso": []}
        noticacoes["Sucesso"].push("Login feito com sucesso")
        localStorage.setItem("notificacoes", JSON.stringify(noticacoes))
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
    const response = await fetch("https://skillup-api-qxon.onrender.com/auth/signin", {
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
    if(response.status == 200) {
        console.log(data)
        login(email, senha)
    }
    if(response.status == 400) {
        document.getElementById("mensagemErro").style.display = "block";
        document.getElementById("mensagemErro").textContent = "O e-mail já está cadastrado";
    }
}


async function getInfos(idUser) {
    const response = await fetch(`https://skillup-api-qxon.onrender.com/profile/getinfo/${idUser}`, {
        method: 'GET',
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
        window.location.href = "./"
    }
}

async function editarPerfil() {
    const nome = document.getElementById("editarNome").value;
    const desc = document.getElementById("editarDesc").value;

    if(desc.length <= 150) {
        const response = await fetch("https://skillup-api-qxon.onrender.com/profile/editarPerfil", {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${localStorage.getItem("access-token")}`
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
            document.getElementById("nivel").style.display = "inline-block"
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
    const response = await fetch("https://skillup-api-qxon.onrender.com/profile/atualizarRanking", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
    })

    const data = await response.json()
    console.log(data)
}

async function getUserConquistas(idUser) {
    const response = await fetch(`https://skillup-api-qxon.onrender.com/profile/getUserConquistas/${idUser}`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
        },
    })
    const data = await response.json()
    return data
}

async function atualizarConquistas(idUser) {
    const response = await fetch(`https://skillup-api-qxon.onrender.com/profile/atualizarConquistas/${idUser}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
    })
}

async function conquistas() {
    const response = await fetch("https://skillup-api-qxon.onrender.com/profile/conquistas", {
        method: "GET",
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
    const response = await fetch("https://skillup-api-qxon.onrender.com/profile/getRanking", {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        },
    })

    const data = await response.json()
    return data
}


async function organizarRanking(espaco, type, query="") {
    const rank = await getRanking()
    const rankingGeral = document.getElementById(espaco)
    console.log(rank)

    if(type == "ranking") {
        document.getElementById("numParticipantes").textContent = Object.keys(rank).length
        const verify = await verificar()
        if (verify) {
            const response = await fetch(`https://skillup-api-qxon.onrender.com/profile/getinfo/${verify["id"]}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${localStorage.getItem("access-token")}`
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
    } else if(type == "top10") {
        let count = 0
        for (let i in rank) {
            if(count >= 10) break

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
    } else if(type == "query") {
        rankingGeral.replaceChildren()

        for (let i in rank) {
            if(rank[i]["nome"].toLocaleLowerCase().includes(query.toLocaleLowerCase())) {
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
            }
        }
    }
}

async function editarSenha() {
    const senha = document.getElementById("senhaAtual").value;
    const novaSenha = document.getElementById("novaSenha").value;
    const confirmNovaSenha = document.getElementById("confirmNovaSenha").value;

    if(novaSenha == confirmNovaSenha) {
        const response = await fetch("https://skillup-api-qxon.onrender.com/auth/editarSenha", {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${localStorage.getItem("access-token")}`
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

    const response = await fetch("https://skillup-api-qxon.onrender.com/auth/editarNome", {
        method: "PATCH",
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${localStorage.getItem("access-token")}`
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


function logout() {
    localStorage.removeItem("access-token")
    localStorage.removeItem("refresh-token")
    window.location.href = "./"
}


async function deletarConta() {
    const response = await fetch("https://skillup-api-qxon.onrender.com/auth/deletarConta", {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${localStorage.getItem("access-token")}`
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


async function validarTurmaInfos() {
    const nome = document.getElementById("criarTurmaNome").value
    const senha = document.getElementById("criarTurmaSenha").value
    const confirmSenha = document.getElementById("confirmarTurmaSenha").value
    const desc = document.getElementById("criarTurmaDesc").value

    if(senha.length >= 8) {
        if(!senha.includes(" ")) {
            if(senha == confirmSenha) {
                criarTurma(nome, senha, desc)
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


async function criarTurma(nome, senha, desc) {
    const response = await fetch("https://skillup-api-qxon.onrender.com/turmas/criar", {
        method: "POST",
        headers: {
            'content-type': 'application/json',
            "Authorization": `Bearer ${localStorage.getItem("access-token")}`
        },
        body: JSON.stringify({
            "nome": nome,
            "senha": senha,
            "desc": desc
        })
    })
    const data = await response.json()
    console.log(data["detail"])

    if(response.status == 200) {
        const criarTurma = document.querySelector(".criarTurmaInterface")
        const professorTurmas = document.querySelector(".professorTurmas")

        if (criarTurma.style.display === "none") {
            criarTurma.style.display = "flex"
            professorTurmas.style.display = "none"
        } else {
            criarTurma.style.display = "none"
            professorTurmas.style.display = "flex"
        }
    } else if(response.status == 401 && ["Access token expirado", "Access token não encontrado"].includes(data["detail"])) {
        const refresh = await refreshToken()
        if(refresh) {
            criarTurma(nome, senha, desc)
        } else {
            window.location.href = "./"
            alert("Não autorizado")
        }
    } else if(response.status == 401 && data["detail"] == "Acesso restrito, apenas professores.") {
        alert("Somente professores podem realizar esta ação")
    }
}


async function listarTurmas(espaco, type, query="") {
    const locate = document.getElementById(espaco)

    const response = await fetch("https://skillup-api-qxon.onrender.com/turmas/listarTurmas", {
        method: "GET",
        headers: {
            'content-type': 'application/json',
            "Authorization": `Bearer ${localStorage.getItem("access-token")}`
        }
    })
    const data = await response.json()
    console.log(data)

    if(response.status == 200) {
        if(type == "minhasTurmas") {
            for(let i in data["turmas"]) {
                if(data["userTurmas"].includes(data["turmas"][i]["id"])) {
                    const div = document.createElement("div")
                    div.classList.add("userTurmaContentItem")
                    div.onclick = () => {window.location.href = `./turma.html?id=${data["turmas"][i]["id"]}`}

                    const h4 = document.createElement("h4")
                    h4.textContent = data["turmas"][i]["nome"]
                    const p = document.createElement("p")
                    p.textContent = "Nome do prof"

                    div.appendChild(h4)
                    div.appendChild(p)
                    locate.appendChild(div)
                }
            }
        } else if(type == "entrarTurma") {
            for(let i in data["turmas"]) {
                const div = document.createElement("div")
                div.classList.add("entrarTurmaInterfaceContentItem")
                div.onclick = () => {window.location.href = `./turma.html?id=${data["turmas"][i]["id"]}`}

                const h4 = document.createElement("h4")
                h4.textContent = data["turmas"][i]["nome"]
                const p = document.createElement("p")
                p.textContent = "Nome do prof"

                div.appendChild(h4)
                div.appendChild(p)
                locate.appendChild(div)
            }
        } else if(type == "query") {
            locate.replaceChildren()

            for(let i in data["turmas"]) {
                if(data["turmas"][i]["nome"].includes(query)) {
                    const div = document.createElement("div")
                    div.classList.add("entrarTurmaInterfaceContentItem")
                    div.onclick = () => {window.location.href = `./turma.html?id=${data["turmas"][i]["id"]}`}

                    const h4 = document.createElement("h4")
                    h4.textContent = data["turmas"][i]["nome"]
                    const p = document.createElement("p")
                    p.textContent = "Nome do prof"

                    div.appendChild(h4)
                    div.appendChild(p)
                    locate.appendChild(div)
                }
            }
        } else if(type == "professorTurmas") {
            const verify = await verificar()
            if(verify && verify.isProfessor) {
                for(let i in data["turmas"]) {
                    if(data["turmas"][i]["idProfessor"] == verify.id) {
                        const div = document.createElement("div")
                        div.classList.add("professorTurmasContentItem")
                        div.onclick = () => {window.location.href = `./turma.html?id=${data["turmas"][i]["id"]}`}

                        const h4 = document.createElement("h4")
                        h4.textContent = data["turmas"][i]["nome"]

                        div.appendChild(h4)
                        locate.appendChild(div)
                    }
                }
            }
        }
    } else if(response.status == 401 && ["Access token expirado", "Access token não encontrado"].includes(data["detail"])) {
        const refresh = await refreshToken()
        if(refresh) {
            listarTurmas(espaco, type, query)
        }
    }
}


async function entrarTurma(idTurma, senha) {
    const response = await fetch(`https://skillup-api-qxon.onrender.com/turmas/entrar/${idTurma}`, {
        method: "POST",
        headers: {
            'content-type': 'application/json',
            "Authorization": `Bearer ${localStorage.getItem("access-token")}`
        },
        body: JSON.stringify({
            senha: senha
        })
    })
    const data = await response.json()
    console.log(data)

    if(response.status == 200) {
        console.log(data)
        window.location.reload()
    } else if(response.status == 401 && ["Access token expirado", "Access token não encontrado"].includes(data["detail"])) {
        const refresh = await refreshToken()
        if(refresh) {
            entrarTurma(idTurma, senha)
        } else {
            window.location.href = "./"
            alert("Não autorizado")
        }
    } else if(response.status == 404) {
        alert("Turma não encontrada")
    } else if(response.status == 401 && data["detail"] == "Senha incorreta") {
        const mensagemErro = document.getElementById("mensagemErroTurmaSenha")
        mensagemErro.textContent = "senha incorreta"
        mensagemErro.style.display = "block"
    }
}


async function sairTurma(idTurma) {
    const response = await fetch(`https://skillup-api-qxon.onrender.com/turmas/sair/${idTurma}`, {
        method: "DELETE",
        headers: {
            'content-type': 'application/json',
            "Authorization": `Bearer ${localStorage.getItem("access-token")}`
        }
    })
    const data = response.json()

    if(response.status == 200) {
        console.log("Sucesso")
        window.location.reload()
    } else if(response.status == 401 && ["Access token expirado", "Access token não encontrado"].includes(data["detail"])) {
        const refresh = await refreshToken()
        if(refresh) {
            sairTurma(idTurma)
        } else {
            window.location.href = "./"
            alert("Não autorizado")
        }
    } else if(response.status == 404) {
        window.location.href = "./"
    }
}


async function turmaInfos(idTurma) {
    const response = await fetch(`https://skillup-api-qxon.onrender.com/turmas/turmaInfos/${idTurma}`, {
        method: "GET",
        headers: {
            'content-type': 'application/json'
        }
    })
    const data = await response.json()
    console.log(data)
    if(response.status == 200) {
        const nome = document.getElementById("nomeTurma")
        const prof = document.getElementById("profTurma")
        const desc = document.getElementById("descTurma")

        nome.textContent = data["nome"]
        prof.textContent = `Professor ${data["nomeProf"]}`
        desc.textContent = data["desc"]

        const verify = await verificar()
        if(verify && !verify.isProfessor) {
            document.querySelector(".turmaDesafiosProf").style.display = "none"

            if(Object.hasOwn(data["alunos"], verify.id)) {
                document.querySelector(".turmaConfigAlunoOn").style.display = "flex"
                document.querySelector(".turmaConfigAlunoOff").style.display = "none"
                document.querySelector(".turmaDesafio").style.display = "block"
                document.querySelector(".turmaDesafiosAluno").style.display = "flex"
            } else {
                document.querySelector(".turmaConfigAlunoOn").style.display = "none"
                document.querySelector(".turmaConfigAlunoOff").style.display = "flex"
                document.querySelector(".turmaDesafio").style.display = "none"
            }
        } else if(verify && verify.isProfessor && data["idProf"] == verify.id){
            document.querySelector(".turmaDesafiosProf").style.display = "flex"
            document.querySelector(".turmaDesafiosAluno").style.display = "none"
        } else {
            document.querySelector(".turmaConfig").style.display = "none"
            document.querySelector(".turmaDesafio").style.display = "none"
        }

        const locate = document.getElementById("turmaAlunosContent")

        for(let i in data["alunos"]) {
            const div = document.createElement("div")
            div.classList.add("turmaAlunosContentItem")

            const h3 = document.createElement("h3")
            h3.textContent = data["alunos"][i]["nome"]
            h3.onclick = () => {window.location.href = `./perfil.html?id=${i}`}
            const p = document.createElement("p")
            p.textContent = `${data["alunos"][i]["pontos"]} pts`

            div.appendChild(h3)
            div.appendChild(p)
            locate.appendChild(div)
        }
    } else if(response.status == 404) {
        window.location.href = "./"
        alert("Turma não encontrada")
    }
}


async function criarDesafio(idTurma) {
    const pergunta = document.getElementById("perguntaInput").value
    const item1 = document.getElementById("item1Input").value
    const item2 = document.getElementById("item2Input").value
    const item3 = document.getElementById("item3Input").value
    const item4 = document.getElementById("item4Input").value
    const itemCorreto = document.getElementById("itemCorretoInput").value
    const dataDesafio = document.getElementById("dataInput").value

    const date = new Date();
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const dia = String(date.getDate()).padStart(2, '0');
    const hoje = `${ano}-${mes}-${dia}`;

    const response = await fetch(`https://skillup-api-qxon.onrender.com/desafios/criar`, {
        method: "POST",
        headers: {
            'content-type': 'application/json',
            "Authorization": `Bearer ${localStorage.getItem("access-token")}`
        },
        body: JSON.stringify({
            idTurma: idTurma,
            dataCriacao: hoje,
            pergunta: pergunta,
            data: dataDesafio,
            item1: item1,
            item2: item2,
            item3: item3,
            item4: item4,
            itemCorreto: itemCorreto
        })
    })
    const data = await response.json()
    if(response.status == 200) {
        criarNotification("Sucesso", "Desafio criado com secesso")
        return true
    } else if(response.status == 401 && ["Access token expirado", "Access token não encontrado"].includes(data["detail"])) {
        const refresh = await refreshToken()
        if(refresh) {
            criarDesafio(idTurma)
        } else {
            const men = document.getElementById("menssagemErroDesafio")
            men.textContent = "Você não tem permissão para realizar esta ação"
            men.style.display = "block"
        }
    } else if(response.status == 400 && data["detail"] == "Data invalida") {
        const men = document.getElementById("menssagemErroDesafio")
        men.textContent = "Data inválida"
        men.style.display = "block"
    } else if(response.status == 404) {
        const men = document.getElementById("menssagemErroDesafio")
        men.textContent = "Turma não encontrada"
        men.style.display = "block"
    } else if(response.status == 400 && data["detail"] == "Pergunta já registrada nesta turma") {
        const men = document.getElementById("menssagemErroDesafio")
        criarNotification("Erro", "Pergunta já registrada nesta turma")
        men.textContent = "Pergunta já registrada nesta turma"
        men.style.display = "block"
    }
}


async function listarUserDesafios() {
    const response = await fetch(`https://skillup-api-qxon.onrender.com/desafios/listar`, {
        method: "GET",
        headers: {
            'content-type': 'application/json',
            "Authorization": `Bearer ${localStorage.getItem("access-token")}`
        }
    })
    const data = await response.json()
    if(response.status == 200) {
        console.log(data)
        return data
    } else if(response.status == 401 && ["Access token expirado", "Access token não encontrado"].includes(data["detail"])) {
        const refresh = await refreshToken()
        if(refresh) {
            listarUserDesafios()
        } else {
            window.location.href = "./"
            alert("Não autorizado")
        }
    }
}


async function getDesafiosDiarios (idTurma) {
    const response = await fetch(`https://skillup-api-qxon.onrender.com/desafios/desafiosDiarios/${idTurma}`, {
        method: "GET",
        headers: {
            'content-type': 'application/json',
            "Authorization": `Bearer ${localStorage.getItem("access-token")}`
        }
    })
    const data = await response.json()
    if(response.status == 200) {
        console.log(data)

        const numeroDesafios = data.length
        let results = {}

        const pergunta = document.querySelector(".pergunta")
        const item1Content = document.querySelector(".item1Content")
        const item2Content = document.querySelector(".item2Content")
        const item3Content = document.querySelector(".item3Content")
        const item4Content = document.querySelector(".item4Content")
        play(0)

        function play (i) {
            const itens = document.querySelectorAll(".desafioInterfaceContentItem")
            itens.forEach((e) => {
                e.style.backgroundColor = "#0E2A36"
                e.style.borderColor = "#35576b"
            })
            
            const itemCorreto = document.getElementById(`item${data[i]["itemCorreto"]}`)
            const proxBtt = document.getElementById("proxBtt")
            proxBtt.style.display = "none"
            proxBtt.onclick = () => {play(i + 1)}

            pergunta.textContent = `${i + 1}. ${data[i]["pergunta"]}`
            item1Content.textContent = data[i]["item1"]
            item2Content.textContent = data[i]["item2"]
            item3Content.textContent = data[i]["item3"]
            item4Content.textContent = data[i]["item4"]

            itemCorreto.onclick = () => {
                console.log("acertou")
                results[data[i]["id"]] = true
                console.log(results)

                if(i + 1 < numeroDesafios) {
                    itemCorreto.style.backgroundColor = "#12363C"
                    itemCorreto.style.borderColor = "#10CFA6"
                    proxBtt.style.display = "block"
                    invalidar()
                } else {
                    itemCorreto.style.backgroundColor = "#12363C"
                    itemCorreto.style.borderColor = "#10CFA6"
                    proxBtt.style.display = "block"
                    proxBtt.textContent = "Ver resultados"
                    invalidar()
                    proxBtt.onclick = () => {showResults()}
                }
            }
            itens.forEach( (e) => {
                if(e != itemCorreto) {
                    e.onclick = () => {
                        console.log("erro")
                        results[data[i]["id"]] = false
                        console.log(results)

                        if(i + 1 < numeroDesafios) {
                            e.style.backgroundColor = "#8B1E1E"
                            e.style.borderColor = "#FF4D4D"
                            proxBtt.style.display = "block"
                            invalidar()
                        } else {
                            e.style.backgroundColor = "#8B1E1E"
                            e.style.borderColor = "#FF4D4D"
                            proxBtt.textContent = "Ver resultados"
                            proxBtt.style.display = "block"
                            invalidar()
                            proxBtt.onclick = () => {showResults()}
                        }
                    }
                }
            })

            function invalidar() {
                itens.forEach((e) => {e.onclick = null})
            }
        }

        function showResults() {
            const locate = document.querySelector(".resultsTableContent")
            const proxBtt = document.getElementById("encerrarBtt")
            proxBtt.onclick = () => {window.location.href = `./turma.html?id=${idTurma}`}

            document.getElementById("desafioInterface").style.display = "none"
            document.getElementById("resultsTable").style.display = "block"

            for(let i in data) {
                if(results[data[i]["id"]]) {
                    const div = document.createElement("div")
                    div.classList.add("resultsTableContentItem")
                    div.style.backgroundColor = "#12363C"
                    div.style.borderColor = "#10CFA6"

                    const pergunta = document.createElement("h3")
                    const itemCorreto = document.createElement("p")
                    const p = document.createElement("p")
                    p.textContent = "Resposta Correta:"

                    pergunta.textContent = data[i]["pergunta"]
                    itemCorreto.textContent = data[i][`item${data[i]["itemCorreto"]}`]
                    itemCorreto.style.color = "#18E0B5"

                    div.appendChild(pergunta)
                    div.appendChild(p)
                    div.appendChild(itemCorreto)
                    locate.appendChild(div)
                } else {
                    const div = document.createElement("div")
                    div.classList.add("resultsTableContentItem")
                    div.style.backgroundColor = "#8B1E1E"
                    div.style.borderColor = "#FF4D4D"

                    const pergunta = document.createElement("h3")
                    const itemCorreto = document.createElement("p")
                    const p = document.createElement("p")
                    p.textContent = "Resposta Correta:"

                    pergunta.textContent = data[i]["pergunta"]
                    itemCorreto.textContent = data[i][`item${data[i]["itemCorreto"]}`]
                    itemCorreto.style.color = "#18E0B5"

                    div.appendChild(pergunta)
                    div.appendChild(p)
                    div.appendChild(itemCorreto)
                    locate.appendChild(div)
                }
            }

            for(let i in results) {
                completarDesafio(i, results[i])
            }
        }
    } else if(response.status == 401 && ["Access token expirado", "Access token não encontrado"].includes(data["detail"])) {
        const refresh = await refreshToken()
        if(refresh) {
            getDesafiosDiarios(idTurma)
        } else {
            window.location.href = "./"
            alert("Você não tem acesso este conteudo")
        }
    } else if(response.status == 404) {
        window.location.href = `./turma.html?id=${idTurma}`
        alert("Não há desafios nesta turma")
    }
}


async function completarDesafio(idDesafio, condition) {
    const response = await fetch(`https://skillup-api-qxon.onrender.com/desafios/completar`, {
        method: "POST",
        headers: {
            'content-type': 'application/json',
            "Authorization": `Bearer ${localStorage.getItem("access-token")}`
        },
        body: JSON.stringify({
            idDesafio: idDesafio,
            acerto: condition
        })
    })
    const data = await response.json()
    if(response.status == 200) {
        console.log(data)
    } else if(response.status == 401 && ["Access token expirado", "Access token não encontrado"].includes(data["detail"])) {
        const refresh = await refreshToken()
        if(refresh) {
            completarDesafio(idDesafio, condition)
        } else {
            window.location.href = "./"
            alert("Não autorizado")
        }
    }
}