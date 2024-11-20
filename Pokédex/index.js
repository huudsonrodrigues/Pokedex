const { createApp } = Vue;

createApp({
  data() {
    return {
      pokemons: [],
      loading: true,
      textoBusca: '',
      proximaPagina: 1,
      tipoFiltro: '', // Tipo de Pokémon selecionado
    };
  },
  created() {
    this.chamarAPI();
    window.addEventListener('scroll', this.tratarScroll);
  },
  destroyed() {
    window.removeEventListener('scroll', this.tratarScroll);
  },
  methods: {
    async chamarAPI() {
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/?offset=${(this.proximaPagina - 1) * 151}&limit=${151}`);
        const data = await response.json();
        const promessasDetalhesPokemon = data.results.map(async (pokemon) => this.obterDadosPokemon(pokemon.url));
        const detalhesPokemons = await Promise.all(promessasDetalhesPokemon);
        this.pokemons = [...this.pokemons, ...detalhesPokemons];
        this.proximaPagina++;
        this.loading = false;
      } catch (error) {
        console.error(error);
      }
    },
    async obterDadosPokemon(url) {
      try {
        const response = await fetch(url);
        const data = await response.json();
        return {
          id: data.id,
          name: data.name,
          weight: data.weight,
          height: data.height,
          abilities: data.abilities,
          base_experience: data.base_experience,
          types: data.types,
          sprites: data.sprites,
        };
      } catch (e) {
        console.error(e);
      }
    },
    tratarScroll() {
      const fimDaPagina = document.documentElement.scrollTop + window.innerHeight >= document.documentElement.offsetHeight;
      if (fimDaPagina && !this.loading) {
        this.loading = true;
        this.chamarAPI();
      }
    },
    obterClasseTipo(pokemon) {
      return {
        backgroundColor: '#4CAF50', // Cor verde para todos os cards
        color: 'white', // Cor do texto em branco
      };
    },
    async buscarPokemon() {
      if (this.textoBusca === '') {
        this.pokemons = [];
        this.proximaPagina ? this.chamarAPI() : this.pokemons = [];
      } else {
        try {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${this.textoBusca.toLowerCase()}`);
          const pokemon = await response.json();
          this.pokemons = [pokemon];
        } catch (error) {
          console.error(error);
        }
      }
    },
    filtrarPokemons() {
      if (this.tipoFiltro) {
        this.pokemons = this.pokemons.filter(pokemon => pokemon.types.some(type => type.type.name === this.tipoFiltro));
      } else {
        this.chamarAPI();
      }
    }
  },
}).mount('#app');
