#include <algorithm>
#include <chrono>
#include <iomanip>
#include <iostream>
#include <memory>
#include <optional>
#include <queue>
#include <random>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

#include<compare>
#include<ranges>
#include<concepts>
namespace una_puno {

enum class EstadoAcademico {
    ACTIVO,
    EGRESADO,
    RETIRADO,
    SUSPENDIDO
};

inline std::string estadoStr(EstadoAcademico e) {
    switch (e) {
        case EstadoAcademico::ACTIVO:     return "ACTIVO";
        case EstadoAcademico::EGRESADO:   return "EGRESADO";
        case EstadoAcademico::RETIRADO:   return "RETIRADO";
        case EstadoAcademico::SUSPENDIDO: return "SUSPENDIDO";
        default:                          return "DESCONOCIDO";
    }
}

struct Estudiante {
    int codigo;
    std::string nombre;
    std::string escuela;
    float ppa;
    int creditos;
    EstadoAcademico estado;
    std::string semestre_ingreso;
    Estudiante(
        int cod,
        std::string nom,
        std::string esc,
        float pp,
        int cred,
        EstadoAcademico est,
        std::string sem
    )
    : codigo(cod),
    nombre(std::move(nom)),
    escuela(std::move(esc)),
    ppa(pp),
    creditos(cred),
    estado(est),
    semestre_ingreso(std::move(sem))
    {
        if (cod < 10000000 || cod > 29999999){
            throw std::invalid_argument("codigo invalido:" + std::to_string(cod));
        }
        if (pp < 0.0f || pp> 20.0f) {
            throw std::invalid_argument("PPA FUERA DE RANGO [20,0]");
        }
    }
    //
    std::strong_ordering operator<=>(const Estudiante& otro) const {
        return codigo <=> otro.codigo;
    }
    bool operator==(const Estudiante& otro) const {
        return codigo == otro.codigo;
    }
    //
    
    void print() const {
        std::cout << std::left
                  << std::setw(12) << codigo
                  << std::setw(35) << nombre
                  << std::setw(20) << escuela
                  << std::setw(8)  << std::fixed << std::setprecision(1) << ppa
                  << std::setw(10) << creditos
                  << std::setw(12) << estadoStr(estado)
                  << semestre_ingreso << '\n';
    }
};

struct NodoBST {
    Estudiante dato;
    std::unique_ptr<NodoBST> izquierdo;
    std::unique_ptr<NodoBST> derecho;

    explicit NodoBST(Estudiante e)
        : dato(std::move(e)), izquierdo(nullptr), derecho(nullptr) {}
};

class ArbolAcademico {
private:
    std::unique_ptr<NodoBST> raiz;
//
    void insertar_(std::unique_ptr<NodoBST>& nodo, Estudiante e) {
        if (!nodo) {
            nodo = std::make_unique<NodoBST>(std::move(e));
            return;
        }
        const auto orden = e <=> nodo ->dato;
        if (orden < 0) {
            insertar_(nodo->izquierdo,std::move(e));
        }else if (orden > 0) {
                insertar_(nodo->derecho, std::move(e));
        } else {
                throw std::runtime_error("codigo duplicado" + std::to_string(e.codigo));
        }
    }
//
    const NodoBST* buscar_(const NodoBST* nodo, int codigo) const {
        if (!nodo || nodo->dato.codigo == codigo) return nodo;
        if (codigo < nodo->dato.codigo) return buscar_(nodo->izquierdo.get(), codigo);
        return buscar_(nodo->derecho.get(), codigo);
    }

    std::unique_ptr<NodoBST> eliminar_(std::unique_ptr<NodoBST> nodo, int codigo) {
        if (!nodo) return nullptr;
        if (codigo < nodo->dato.codigo)
            nodo->izquierdo = eliminar_(std::move(nodo->izquierdo), codigo);
        else if (codigo > nodo->dato.codigo)
            nodo->derecho = eliminar_(std::move(nodo->derecho), codigo);
        else {
            if (!nodo->izquierdo) return std::move(nodo->derecho);
            if (!nodo->derecho)   return std::move(nodo->izquierdo);
            NodoBST* sucesor = minimo_(nodo->derecho.get());
            nodo->dato = sucesor->dato;
            nodo->derecho = eliminar_(std::move(nodo->derecho), sucesor->dato.codigo);
        }
        return nodo;
    }

    NodoBST* minimo_(NodoBST* nodo) const {
        while (nodo->izquierdo) nodo = nodo->izquierdo.get();
        return nodo;
    }

    void inOrder_(const NodoBST* nodo, std::vector<Estudiante>& res) const {
        if (!nodo) return;
        inOrder_(nodo->izquierdo.get(), res);
        res.push_back(nodo->dato);
        inOrder_(nodo->derecho.get(), res);
    }

    void preOrder_(const NodoBST* nodo, std::vector<Estudiante>& res) const {
        if (!nodo) return;
        res.push_back(nodo->dato);
        preOrder_(nodo->izquierdo.get(), res);
        preOrder_(nodo->derecho.get(), res);
    }

    void postOrder_(const NodoBST* nodo, std::vector<Estudiante>& res) const {
        if (!nodo) return;
        postOrder_(nodo->izquierdo.get(), res);
        postOrder_(nodo->derecho.get(), res);
        res.push_back(nodo->dato);
    }

    int altura_(const NodoBST* nodo) const {
        if (!nodo) return -1;
        return 1 + std::max(altura_(nodo->izquierdo.get()), altura_(nodo->derecho.get()));
    }

    void buscarRangoCodigo_(const NodoBST* nodo, int codMin, int codMax, std::vector<Estudiante>& res) const {
        if (!nodo) return;
        if (nodo->dato.codigo > codMin)
            buscarRangoCodigo_(nodo->izquierdo.get(), codMin, codMax, res);
        if (nodo->dato.codigo >= codMin && nodo->dato.codigo <= codMax)
            res.push_back(nodo->dato);
        if (nodo->dato.codigo < codMax)
            buscarRangoCodigo_(nodo->derecho.get(), codMin, codMax, res);
    }

    void imprimir_(const NodoBST* nodo, const std::string& prefix, bool isLeft) const {
        if (!nodo) return;
        std::cout << prefix << (isLeft ? "+-- " : "`-- ")
                  << nodo->dato.codigo << " [PPA:"
                  << std::fixed << std::setprecision(1) << nodo->dato.ppa << "]\n";
        std::string ext = isLeft ? "|   " : "    ";
        imprimir_(nodo->izquierdo.get(), prefix + ext, true);
        imprimir_(nodo->derecho.get(),   prefix + ext, false);
    }

public:
    ArbolAcademico() = default;

    void insertar(Estudiante e) { insertar_(raiz, std::move(e)); }

    std::optional<Estudiante> buscar(int codigo) const {
        const NodoBST* nodo = buscar_(raiz.get(), codigo);
        if (nodo) return nodo->dato;
        return std::nullopt;
    }

    void eliminar(int codigo) {
        if (!buscar(codigo))
            throw std::runtime_error("Codigo no encontrado: " + std::to_string(codigo));
        raiz = eliminar_(std::move(raiz), codigo);
    }

    std::optional<Estudiante> maximo() const {
        if (!raiz) return std::nullopt;
        const NodoBST* nodo = raiz.get();
        while (nodo->derecho) nodo = nodo->derecho.get();
        return nodo->dato;
    }

    std::vector<Estudiante> inOrder()   const { std::vector<Estudiante> r; inOrder_(raiz.get(), r);   return r; }
    std::vector<Estudiante> preOrder()  const { std::vector<Estudiante> r; preOrder_(raiz.get(), r);  return r; }
    std::vector<Estudiante> postOrder() const { std::vector<Estudiante> r; postOrder_(raiz.get(), r); return r; }

    std::vector<Estudiante> bfs() const {
        std::vector<Estudiante> res;
        if (!raiz) return res;
        std::queue<const NodoBST*> cola;
        cola.push(raiz.get());
        while (!cola.empty()) {
            const NodoBST* actual = cola.front(); cola.pop();
            res.push_back(actual->dato);
            if (actual->izquierdo) cola.push(actual->izquierdo.get());
            if (actual->derecho)   cola.push(actual->derecho.get());
        }
        return res;
    }

    int altura() const { return altura_(raiz.get()); }

    void estadisticas() const {
        auto todos = inOrder();
        if (todos.empty()) { std::cout << "Arbol vacio\n"; return; }
        float suma = 0.0f, mn = 20.0f, mx = 0.0f;
        int activos = 0;
        for (const auto& e : todos) {
            suma += e.ppa;
            if (e.ppa < mn) mn = e.ppa;
            if (e.ppa > mx) mx = e.ppa;
            if (e.estado == EstadoAcademico::ACTIVO) activos++;
        }
        std::cout << std::fixed << std::setprecision(2)
                  << "Total nodos  : " << todos.size() << '\n'
                  << "Altura       : " << altura()     << '\n'
                  << "PPA promedio : " << suma / todos.size() << '\n'
                  << "PPA minimo   : " << mn      << '\n'
                  << "PPA maximo   : " << mx      << '\n'
                  << "Activos      : " << activos << '\n';
    }
//
    std::vector<Estudiante> porRangoPPA(float ppaMin, float ppaMax = 20.0f) const {
        auto todos = inOrder();
        auto vista = todos | std::views::filter(
            [ppaMin, ppaMax](const Estudiante& e) {
                return e.ppa >= ppaMin && e.ppa <= ppaMax;
            }
        );
    return std::vector<Estudiante>(vista.begin(), vista.end());
    }
//
//
    std::vector<Estudiante> porEscuela( const std::string& escuela) const {
        auto todos = inOrder();
        auto vista = todos | std::views::filter(
            [&escuela](const Estudiante& e) {
                return e.escuela == escuela;
            }
        );
        return std::vector<Estudiante>(vista.begin(), vista.end());
    }
//
//
    std::vector<Estudiante> porEstado(EstadoAcademico estado) const {
        auto todos = inOrder();
        auto vista = todos | std::views::filter(
            [estado](const Estudiante& e) {
                return e.estado == estado;
            }
        );
        return  std::vector<Estudiante>(vista.begin(), vista.end());
    }
//
    std::vector<Estudiante> buscarRangoCodigo(int codMin, int codMax) const {
        std::vector<Estudiante> res;
        buscarRangoCodigo_(raiz.get(), codMin, codMax, res);
        return res;
    }

    void imprimirArbol() const {
        std::cout << "\n-- Estructura del BST --\n";
        imprimir_(raiz.get(), "", false);
    }
};
}
 // namespace una_puno
//AGREGAMOS
template <typename T>
concept RegistroAcademico = requires(T e){
    {e.codigo} -> std::convertible_to<int>;
    {e.print()} -> std::same_as<void>;
};
//
//
template <RegistroAcademico T>
void imprimirTabla(const std::vector<T>& estudiantes, const std::string& titulo)
//
{
    std::cout << "\n-- " << titulo << " --\n";
    std::cout << std::left
              << std::setw(12) << "CODIGO"
              << std::setw(35) << "NOMBRE"
              << std::setw(20) << "ESCUELA"
              << std::setw(8)  << "PPA"
              << std::setw(10) << "CREDITOS"
              << std::setw(12) << "ESTADO"
              << "SEMESTRE\n";
    std::cout << std::string(110, '-') << '\n';
    for (const auto& e : estudiantes) e.print();
}

std::vector<una_puno::Estudiante> crearDatosPrueba() {
    using namespace una_puno;
    return {
        {20210500, "Mamani Quispe, Juan",    "Ing. Sistemas", 15.8f, 120, EstadoAcademico::ACTIVO,     "2021-I"},
        {20210300, "Huanca Apaza, Maria",    "Ing. Civil",    14.2f, 110, EstadoAcademico::ACTIVO,     "2021-I"},
        {20210700, "Condori Flores, Pedro",  "Medicina",      17.1f, 130, EstadoAcademico::ACTIVO,     "2021-I"},
        {20210100, "Ticona Lupaca, Rosa",    "Contabilidad",  12.0f,  90, EstadoAcademico::SUSPENDIDO, "2021-I"},
        {20210400, "Larico Ccama, Carlos",   "Ing. Sistemas", 16.5f, 115, EstadoAcademico::ACTIVO,     "2021-I"},
        {20210600, "Cutipa Vargas, Elena",   "Agronomia",     13.7f, 100, EstadoAcademico::ACTIVO,     "2021-I"},
        {20210900, "Pari Choque, Luis",      "Ing. Sistemas", 18.3f, 140, EstadoAcademico::EGRESADO,   "2021-I"},
    };
}

std::vector<una_puno::Estudiante> generarDatos(int n) {
    using namespace una_puno;
    std::mt19937 rng(42);
    std::uniform_int_distribution<int> distCod(20000000, 29999999);
    std::uniform_real_distribution<float> distPPA(8.0f, 20.0f);
    std::vector<int> codigos;
    while (static_cast<int>(codigos.size()) < n) codigos.push_back(distCod(rng));
    std::sort(codigos.begin(), codigos.end());
    codigos.erase(std::unique(codigos.begin(), codigos.end()), codigos.end());
    while (static_cast<int>(codigos.size()) < n) {
        int c = distCod(rng);
        if (!std::binary_search(codigos.begin(), codigos.end(), c)) {
            codigos.push_back(c);
            std::sort(codigos.begin(), codigos.end());
        }
    }
    codigos.resize(n);
    std::shuffle(codigos.begin(), codigos.end(), rng);
    std::vector<Estudiante> datos;
    for (int i = 0; i < n; i++)
        datos.emplace_back(codigos[i], "Estudiante_" + std::to_string(i), "Ingenieria", distPPA(rng), 100, EstadoAcademico::ACTIVO, "2024-I");
    return datos;
}

void benchmark(int n) {
    using namespace una_puno;
    using Clock = std::chrono::high_resolution_clock;
    auto datos = generarDatos(n);
    int buscarCod = datos[n / 2].codigo;
    ArbolAcademico arbol;
    auto t0 = Clock::now();
    for (auto& e : datos) arbol.insertar(e);
    auto t1 = Clock::now();
    double msIns = std::chrono::duration<double, std::milli>(t1 - t0).count();
    auto t2 = Clock::now();
    arbol.buscar(buscarCod);
    auto t3 = Clock::now();
    double msBus = std::chrono::duration<double, std::milli>(t3 - t2).count();
    std::cout << std::setw(8) << n
              << " | ins: " << std::fixed << std::setprecision(3) << std::setw(9) << msIns << " ms"
              << " | bus: " << std::setw(8) << msBus << " ms"
              << " | altura: " << arbol.altura() << '\n';
}

int main() {
    using namespace una_puno;
    std::cout << "=== BST Sistema Academico UNA-PUNO (C++17) ===\n";
    ArbolAcademico arbol;
    for (auto& e : crearDatosPrueba()) arbol.insertar(e);
    arbol.imprimirArbol();
    imprimirTabla(arbol.inOrder(), "IN-ORDER: ORDENADO POR CODIGO");
    std::cout << "\nBFS nivel por nivel:\n";
    for (const auto& e : arbol.bfs()) std::cout << e.codigo << " ";
    std::cout << '\n';
    auto encontrado = arbol.buscar(20210700);
    if (encontrado) imprimirTabla({*encontrado}, "CODIGO 20210700");
    auto noExiste = arbol.buscar(99999999);
    std::cout << "Buscar 99999999: " << (noExiste ? "encontrado" : "no encontrado") << '\n';
    imprimirTabla(arbol.porRangoPPA(15.0f),               "ESTUDIANTES CON PPA >= 15.0");
    imprimirTabla(arbol.porEscuela("Ing. Sistemas"),       "ESTUDIANTES DE ING. SISTEMAS");
    imprimirTabla(arbol.porEstado(EstadoAcademico::ACTIVO),"ESTUDIANTES ACTIVOS");
    std::cout << "\n-- Estadisticas --\n";
    arbol.estadisticas();
    std::cout << "\nEliminando codigo 20210300...\n";
    arbol.eliminar(20210300);
    imprimirTabla(arbol.inOrder(), "IN-ORDER DESPUES DE ELIMINAR 20210300");
    auto mayor = arbol.maximo();
    if (mayor) imprimirTabla({*mayor}, "ESTUDIANTE CON MAYOR CODIGO");
    imprimirTabla(arbol.buscarRangoCodigo(20210400, 20210700), "BUSQUEDA POR RANGO DE CODIGO [20210400, 20210700]");
    return 0;
}
