class ShoppingList {
  constructor() {
    this.name = "Sam Goto";
  }

  render() {
    return div({className: "shopping-list"}) {
      h1 { `Shopping List for ${this.name}` }
      ul {
	li { "Instagram" }
	li { "What's App" }
	li { "Oculus" }
      }
    }
  }
}

let result = JSON.stringify(new ShoppingList().render(), undefined, ' ');
console.log(result);
