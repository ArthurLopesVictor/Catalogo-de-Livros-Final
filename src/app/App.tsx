import { useState, useMemo, useEffect } from "react";
import { BookOpen } from "lucide-react";
import { SearchBar } from "./components/SearchBar";
import { GenreFilter } from "./components/GenreFilter";
import { BookCard, Livro } from "./components/BookCard";
import { AddBookModal } from "./components/AddBookModal";
import { EditBookModal } from "./components/EditBookModal";
import livrosData from "../data/livros.json";
import { projectId, publicAnonKey } from "/utils/supabase/info";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-45c8de4c`;

export default function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Todos");
  const [allBooks, setAllBooks] = useState<Livro[]>([]);
  const [bookToEdit, setBookToEdit] = useState<Livro | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Carregar livros do banco de dados
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/books`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        let detail = response.statusText;
        try {
          const errBody = await response.json();
          detail = errBody.error || JSON.stringify(errBody);
        } catch {}
        throw new Error(`HTTP ${response.status}: ${detail}`);
      }

      const data = await response.json();
      const dbBooks = data.books || [];
      const deletedIds = data.deletedIds || [];

      // Filtrar livros originais removendo os deletados
      const originalBooks = (livrosData as Livro[]).filter(
        (book) => !deletedIds.includes(book.id)
      );

      const combinedBooks = [...originalBooks, ...dbBooks];

      // Remover duplicatas (priorizar livros do banco de dados - versões editadas)
      const uniqueBooks = combinedBooks.reduce((acc, book) => {
        const existingIndex = acc.findIndex((b) => b.id === book.id);
        if (existingIndex === -1) {
          acc.push(book);
        } else {
          // Se o livro veio do banco de dados, substituir o original (versão editada)
          const isFromDb = dbBooks.some((db) => db.id === book.id);
          if (isFromDb) {
            acc[existingIndex] = book;
          }
        }
        return acc;
      }, [] as Livro[]);

      setAllBooks(uniqueBooks);
    } catch (error) {
      console.error("Erro ao carregar livros do banco de dados:", error);
      // Em caso de erro, usar apenas os livros do JSON
      setAllBooks(livrosData as Livro[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const livros: Livro[] = allBooks;

  // Extrair gêneros únicos dos livros
  const genres = useMemo(() => {
    const uniqueGenres = new Set(livros.map((livro) => livro.genero));
    return Array.from(uniqueGenres).sort();
  }, [livros]);

  // Filtrar livros em tempo real
  const filteredBooks = useMemo(() => {
    return livros.filter((livro) => {
      // Filtro por gênero
      const matchesGenre =
        selectedGenre === "Todos" || livro.genero === selectedGenre;

      // Filtro por busca
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === "" ||
        livro.titulo.toLowerCase().includes(searchLower) ||
        livro.autor.toLowerCase().includes(searchLower) ||
        livro.descricao.toLowerCase().includes(searchLower);

      return matchesGenre && matchesSearch;
    });
  }, [livros, selectedGenre, searchTerm]);

  // Função para adicionar novo livro
  const handleAddBook = async (newBook: Omit<Livro, "id">) => {
    try {
      const allIds = allBooks.map(b => b.id);
      const maxId = Math.max(...allIds, 0);
      const bookWithId: Livro = {
        ...newBook,
        id: maxId + 1,
      };

      const response = await fetch(`${API_URL}/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ book: bookWithId }),
      });

      if (!response.ok) {
        let errorMsg = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }

      // Recarregar livros do banco de dados
      await fetchBooks();
    } catch (error) {
      console.error("Erro ao adicionar livro:", error);
      alert(`Erro ao adicionar livro: ${error.message}`);
    }
  };

  // Função para editar livro
  const handleEditBook = async (id: number, updatedBook: Omit<Livro, "id">) => {
    try {
      const response = await fetch(`${API_URL}/books/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ book: updatedBook }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update book");
      }

      // Recarregar livros do banco de dados
      await fetchBooks();
      setBookToEdit(null);
    } catch (error) {
      console.error("Erro ao editar livro:", error);
      alert(`Erro ao editar livro: ${error.message}`);
    }
  };

  // Função para remover livro
  const handleDeleteBook = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/books/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete book");
      }

      // Recarregar livros do banco de dados
      await fetchBooks();
    } catch (error) {
      console.error("Erro ao remover livro:", error);
      alert(`Erro ao remover livro: ${error.message}`);
    }
  };

  // Função para abrir modal de edição
  const handleOpenEdit = (id: number) => {
    const book = allBooks.find(b => b.id === id);
    if (book) {
      setBookToEdit(book);
      setEditModalOpen(true);
    }
  };

  // Função para fechar modal de edição
  const handleCloseEdit = () => {
    setEditModalOpen(false);
    setBookToEdit(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <BookOpen className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">
              Catálogo de Livros
            </h1>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            <div className="flex gap-2">
              <button
                onClick={fetchBooks}
                disabled={loading}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Sincronizar com o banco de dados"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={loading ? "animate-spin" : ""}
                >
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                </svg>
                Atualizar
              </button>
              <AddBookModal onAddBook={handleAddBook} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtros por Gênero */}
        <div className="mb-8">
          <GenreFilter
            genres={genres}
            selectedGenre={selectedGenre}
            onGenreChange={setSelectedGenre}
          />
        </div>

        {/* Resultados */}
        <div className="mb-6">
          <p className="text-gray-600 text-center">
            {loading ? (
              <span className="text-lg">Carregando livros...</span>
            ) : filteredBooks.length === 0 ? (
              <span className="text-lg">
                Nenhum livro encontrado. Tente outra busca ou filtro.
              </span>
            ) : (
              <span>
                Exibindo <strong>{filteredBooks.length}</strong>{" "}
                {filteredBooks.length === 1 ? "livro" : "livros"}
              </span>
            )}
          </p>
        </div>

        {/* Grade de Livros */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredBooks.map((livro) => (
              <BookCard
                key={livro.id}
                livro={livro}
                onDelete={handleDeleteBook}
                onEdit={handleOpenEdit}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredBooks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <BookOpen className="text-gray-300 mb-4" size={64} />
            <p className="text-gray-400 text-lg">
              Experimente buscar por outro termo ou selecionar um gênero diferente
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600">
          <p className="text-sm">
            Catálogo com Banco de Dados Compartilhado • Supabase
          </p>
          <p className="text-xs mt-2 text-gray-500">
            Livros sincronizados entre todos os usuários
          </p>
        </div>
      </footer>

      {/* Modal de Edição */}
      <EditBookModal
        book={bookToEdit}
        onEditBook={handleEditBook}
        open={editModalOpen}
        onOpenChange={handleCloseEdit}
      />
    </div>
  );
}