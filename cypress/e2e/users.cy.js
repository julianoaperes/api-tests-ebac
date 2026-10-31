/// <reference types ="cypress"/>

let token =
	"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBiaWJsaW90ZWNhLmNvbSIsImlzQWRtaW4iOnRydWUsImlhdCI6MTc5MzQ1MDQ3NywiZXhwIjoxNzkzNDc5Mjc3fQ.jV4gyQntcaRorErRA8_mqMT-NKSuVyoGzjezGfn5biU";
describe("GET: API test - Users management", () => {
	it("Should list all users successfully", () => {
		cy.api({
			method: "GET",
			url: "users",
			headers: {
				Authorization: token,
			},
		}).should((response) => {
			expect(response.status).equal(200);
			expect(response.body.users).to.be.an("array");
		});
	});
	it("Should validate all users properties", () => {
		cy.api({
			method: "GET",
			url: "users",
			headers: {
				Authorization: token,
			},
		}).should((response) => {
			expect(response.status).equal(200);
			expect(response.body.users[0]).to.have.property("id");
			expect(response.body.users[0]).to.have.property("name");
			expect(response.body.users[0]).to.have.property("email");
		});
	});
	it("Should list an user searching by id", () => {
		cy.api({
			method: "GET",
			url: "users/2",
			headers: {
				Authorization: token,
			},
		}).should((response) => {
			expect(response.status).equal(200);
			expect(response.body).to.have.property("id");
			expect(response.body).to.have.property("name");
			expect(response.body).to.have.property("email");
		});
	});
	it("Should list an user by filter", () => {
		cy.api({
			method: "GET",
			url: "users",
			headers: { Authorization: token },
			qs: {
				page: 1,
				limit: 20,
				search: "Usuário",
			},
		}).should((response) => {
			expect(response.status).eq(200);
		});
	});
});
describe("POST: API test - User management", () => {
	it("Sould register an user successfully", () => {
		cy.api({
			method: "POST",
			url: "users",
			body: {
				name: "Maria Santos",
				email: "jp.teste3@email.com",
				password: "senha123",
			},
		}).should((response) => {
			expect(response.status).equal(201);
			expect(response.body.message).equal("Usuário criado com sucesso.");
		});
	});
	it.only("Should validate an user registered with an invalid email", () => {
		cy.api({
			method: "POST",
			url: "users",
			body: {
				name: "Maria Santos",
				email: "jp.teste.email.com",
				password: "senha123",
			},
			failOnStatusCode: false,
		}).should((response) => {
			expect(response.status).equal(400);
			expect(response.body.message).equal("Formato de email inválido.");
		});
	});
});
