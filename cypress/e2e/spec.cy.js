/// <reference types ="cypress"/>
describe("template spec", () => {
	it("passes", () => {
		cy.api("http://localhost:3000/api/books");
	});
});
