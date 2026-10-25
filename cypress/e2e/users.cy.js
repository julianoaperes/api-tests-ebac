/// <reference types ="cypress"/>

let token =
	"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBiaWJsaW90ZWNhLmNvbSIsImlzQWRtaW4iOnRydWUsImlhdCI6MTc5MjkzNDA4MywiZXhwIjoxNzkyOTYyODgzfQ.Gz5nrXYinR25thyLVowJ18LMiz9gRI7tRa2-1BO_lVA";
describe("API test - Users management", () => {
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
});
