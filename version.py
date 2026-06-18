from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Optional, List
from collections import deque
import statistics
import random
import time


class EstadoAcademico(Enum):
    ACTIVO = auto()
    EGRESADO = auto()
    RETIRADO = auto()
    SUSPENDIDO = auto()


@dataclass
class Estudiante:
    codigo: int
    nombre: str
    escuela: str
    ppa: float
    creditos: int
    estado: EstadoAcademico
    semestre_ingreso: str

    def __post_init__(self):
        if not (10_000_000 <= self.codigo <= 29_999_999):
            raise ValueError(f"Codigo invalido: {self.codigo}")
        if not (0.0 <= self.ppa <= 20.0):
            raise ValueError(f"PPA fuera de rango [0,20]: {self.ppa}")


@dataclass
class NodoBST:
    dato: Estudiante
    izquierdo: Optional["NodoBST"] = field(default=None, repr=False)
    derecho: Optional["NodoBST"] = field(default=None, repr=False)


class ArbolAcademico:

    def __init__(self) -> None:
        self._raiz: Optional[NodoBST] = None

    def insertar(self, e: Estudiante) -> None:
        self._raiz = self._insertar(self._raiz, e)

    def _insertar(self, nodo: Optional[NodoBST], e: Estudiante) -> NodoBST:
        if nodo is None:
            return NodoBST(dato=e)
        if e.codigo < nodo.dato.codigo:
            nodo.izquierdo = self._insertar(nodo.izquierdo, e)
        elif e.codigo > nodo.dato.codigo:
            nodo.derecho = self._insertar(nodo.derecho, e)
        else:
            raise ValueError(f"Codigo duplicado: {e.codigo}")
        return nodo

    def buscar(self, codigo: int) -> Optional[Estudiante]:
        nodo = self._buscar(self._raiz, codigo)
        return nodo.dato if nodo else None

    def _buscar(self, nodo: Optional[NodoBST], codigo: int) -> Optional[NodoBST]:
        if nodo is None or nodo.dato.codigo == codigo:
            return nodo
        if codigo < nodo.dato.codigo:
            return self._buscar(nodo.izquierdo, codigo)
        return self._buscar(nodo.derecho, codigo)

    def eliminar(self, codigo: int) -> None:
        if self.buscar(codigo) is None:
            raise KeyError(f"Codigo no encontrado: {codigo}")
        self._raiz = self._eliminar(self._raiz, codigo)

    def _eliminar(self, nodo: Optional[NodoBST], codigo: int) -> Optional[NodoBST]:
        if nodo is None:
            return None
        if codigo < nodo.dato.codigo:
            nodo.izquierdo = self._eliminar(nodo.izquierdo, codigo)
        elif codigo > nodo.dato.codigo:
            nodo.derecho = self._eliminar(nodo.derecho, codigo)
        else:
            if nodo.izquierdo is None:
                return nodo.derecho
            if nodo.derecho is None:
                return nodo.izquierdo
            sucesor = self._minimo(nodo.derecho)
            nodo.dato = sucesor.dato
            nodo.derecho = self._eliminar(nodo.derecho, sucesor.dato.codigo)
        return nodo

    def _minimo(self, nodo: NodoBST) -> NodoBST:
        while nodo.izquierdo:
            nodo = nodo.izquierdo
        return nodo

    def maximo(self) -> Optional[Estudiante]:
        if self._raiz is None:
            return None
        nodo = self._raiz
        while nodo.derecho:
            nodo = nodo.derecho
        return nodo.dato

    def in_order(self) -> List[Estudiante]:
        resultado: List[Estudiante] = []
        self._in_order(self._raiz, resultado)
        return resultado

    def _in_order(self, nodo: Optional[NodoBST], res: List[Estudiante]) -> None:
        if nodo is None:
            return
        self._in_order(nodo.izquierdo, res)
        res.append(nodo.dato)
        self._in_order(nodo.derecho, res)

    def pre_order(self) -> List[Estudiante]:
        resultado: List[Estudiante] = []
        self._pre_order(self._raiz, resultado)
        return resultado

    def _pre_order(self, nodo: Optional[NodoBST], res: List[Estudiante]) -> None:
        if nodo is None:
            return
        res.append(nodo.dato)
        self._pre_order(nodo.izquierdo, res)
        self._pre_order(nodo.derecho, res)

    def post_order(self) -> List[Estudiante]:
        resultado: List[Estudiante] = []
        self._post_order(self._raiz, resultado)
        return resultado

    def _post_order(self, nodo: Optional[NodoBST], res: List[Estudiante]) -> None:
        if nodo is None:
            return
        self._post_order(nodo.izquierdo, res)
        self._post_order(nodo.derecho, res)
        res.append(nodo.dato)

    def bfs(self) -> List[Estudiante]:
        if self._raiz is None:
            return []
        resultado: List[Estudiante] = []
        cola = deque([self._raiz])
        while cola:
            nodo = cola.popleft()
            resultado.append(nodo.dato)
            if nodo.izquierdo:
                cola.append(nodo.izquierdo)
            if nodo.derecho:
                cola.append(nodo.derecho)
        return resultado

    def altura(self) -> int:
        return self._altura(self._raiz)

    def _altura(self, nodo: Optional[NodoBST]) -> int:
        if nodo is None:
            return -1
        return 1 + max(self._altura(nodo.izquierdo), self._altura(nodo.derecho))

    def estadisticas(self) -> dict:
        todos = self.in_order()
        if not todos:
            return {}
        ppas = [e.ppa for e in todos]
        return {
            "total_nodos":   len(todos),
            "altura":        self.altura(),
            "ppa_promedio":  round(statistics.mean(ppas), 2),
            "ppa_minimo":    min(ppas),
            "ppa_maximo":    max(ppas),
            "total_activos": sum(1 for e in todos if e.estado == EstadoAcademico.ACTIVO),
        }

    def por_rango_ppa(self, ppa_min: float, ppa_max: float = 20.0) -> List[Estudiante]:
        return [e for e in self.in_order() if ppa_min <= e.ppa <= ppa_max]

    def por_escuela(self, escuela: str) -> List[Estudiante]:
        return [e for e in self.in_order() if e.escuela == escuela]

    def por_estado(self, estado: EstadoAcademico) -> List[Estudiante]:
        return [e for e in self.in_order() if e.estado == estado]

    def buscar_rango_codigo(self, cod_min: int, cod_max: int) -> List[Estudiante]:
        resultado: List[Estudiante] = []
        self._buscar_rango_codigo(self._raiz, cod_min, cod_max, resultado)
        return resultado

    def _buscar_rango_codigo(self, nodo: Optional[NodoBST], cod_min: int, cod_max: int, resultado: List[Estudiante]) -> None:
        if nodo is None:
            return
        if nodo.dato.codigo > cod_min:
            self._buscar_rango_codigo(nodo.izquierdo, cod_min, cod_max, resultado)
        if cod_min <= nodo.dato.codigo <= cod_max:
            resultado.append(nodo.dato)
        if nodo.dato.codigo < cod_max:
            self._buscar_rango_codigo(nodo.derecho, cod_min, cod_max, resultado)

    def imprimir_arbol(self) -> None:
        print("\n-- Estructura del BST --")
        self._imprimir(self._raiz, "", False)

    def _imprimir(self, nodo: Optional[NodoBST], prefix: str, is_left: bool) -> None:
        if nodo is None:
            return
        conector = "+-- " if is_left else "`-- "
        print(f"{prefix}{conector}{nodo.dato.codigo} [PPA:{nodo.dato.ppa:.1f}]")
        extension = "|   " if is_left else "    "
        self._imprimir(nodo.izquierdo, prefix + extension, True)
        self._imprimir(nodo.derecho,   prefix + extension, False)


def imprimir_tabla(estudiantes: List[Estudiante], titulo: str = "ESTUDIANTES") -> None:
    print(f"\n-- {titulo} --")
    print(f"{'CODIGO':<12}{'NOMBRE':<35}{'ESCUELA':<20}{'PPA':<8}{'CREDITOS':<10}{'ESTADO':<12}{'SEMESTRE'}")
    print("-" * 110)
    for e in estudiantes:
        print(f"{e.codigo:<12}{e.nombre:<35}{e.escuela:<20}{e.ppa:<8.1f}{e.creditos:<10}{e.estado.name:<12}{e.semestre_ingreso}")


def crear_datos_prueba() -> List[Estudiante]:
    return [
        Estudiante(20210500, "Mamani Quispe, Juan",   "Ing. Sistemas", 15.8, 120, EstadoAcademico.ACTIVO,     "2021-I"),
        Estudiante(20210300, "Huanca Apaza, Maria",   "Ing. Civil",    14.2, 110, EstadoAcademico.ACTIVO,     "2021-I"),
        Estudiante(20210700, "Condori Flores, Pedro", "Medicina",      17.1, 130, EstadoAcademico.ACTIVO,     "2021-I"),
        Estudiante(20210100, "Ticona Lupaca, Rosa",   "Contabilidad",  12.0,  90, EstadoAcademico.SUSPENDIDO, "2021-I"),
        Estudiante(20210400, "Larico Ccama, Carlos",  "Ing. Sistemas", 16.5, 115, EstadoAcademico.ACTIVO,     "2021-I"),
        Estudiante(20210600, "Cutipa Vargas, Elena",  "Agronomia",     13.7, 100, EstadoAcademico.ACTIVO,     "2021-I"),
        Estudiante(20210900, "Pari Choque, Luis",     "Ing. Sistemas", 18.3, 140, EstadoAcademico.EGRESADO,   "2021-I"),
    ]


def generar_datos(n: int) -> List[Estudiante]:
    codigos = random.sample(range(20_000_000, 29_999_999), n)
    return [
        Estudiante(cod, f"Estudiante_{i}", "Ingenieria", round(random.uniform(8.0, 20.0), 1), 100, EstadoAcademico.ACTIVO, "2024-I")
        for i, cod in enumerate(codigos)
    ]


def benchmark(n: int) -> None:
    datos = generar_datos(n)
    buscar_cod = datos[n // 2].codigo
    arbol_b = ArbolAcademico()
    t0 = time.perf_counter()
    for e in datos:
        arbol_b.insertar(e)
    t_ins_bst = (time.perf_counter() - t0) * 1000
    t0 = time.perf_counter()
    arbol_b.buscar(buscar_cod)
    t_bus_bst = (time.perf_counter() - t0) * 1000
    diccionario = {}
    t0 = time.perf_counter()
    for e in datos:
        diccionario[e.codigo] = e
    t_ins_dic = (time.perf_counter() - t0) * 1000
    t0 = time.perf_counter()
    _ = diccionario.get(buscar_cod)
    t_bus_dic = (time.perf_counter() - t0) * 1000
    print(
        f"N={n:>8} | "
        f"BST ins:{t_ins_bst:9.2f} ms bus:{t_bus_bst:8.4f} ms | "
        f"Dict ins:{t_ins_dic:9.2f} ms bus:{t_bus_dic:8.4f} ms | "
        f"Altura BST: {arbol_b.altura()}"
    )


def main() -> None:
    print("=== BST Sistema Academico UNA-PUNO (Python 3.11+) ===")
    arbol = ArbolAcademico()
    for estudiante in crear_datos_prueba():
        arbol.insertar(estudiante)
    print(f"\nAltura del arbol: {arbol.altura()}")
    imprimir_tabla(arbol.in_order(), "IN-ORDER: ORDENADO POR CODIGO")
    print("\nBFS nivel por nivel:")
    print([e.codigo for e in arbol.bfs()])
    encontrado = arbol.buscar(20210700)
    if encontrado:
        imprimir_tabla([encontrado], "BUSQUEDA: CODIGO 20210700")
    print(f"\nBuscar 99999999: {arbol.buscar(99999999)}")
    imprimir_tabla(arbol.por_rango_ppa(15.0),                "ESTUDIANTES CON PPA >= 15.0")
    imprimir_tabla(arbol.por_escuela("Ing. Sistemas"),        "ESTUDIANTES DE ING. SISTEMAS")
    imprimir_tabla(arbol.por_estado(EstadoAcademico.ACTIVO),  "ESTUDIANTES ACTIVOS")
    print("\nEstadisticas del arbol:")
    for clave, valor in arbol.estadisticas().items():
        print(f"{clave:<20}: {valor}")
    arbol.imprimir_arbol()
    print("\nEliminando codigo 20210300...")
    arbol.eliminar(20210300)
    imprimir_tabla(arbol.in_order(), "IN-ORDER DESPUES DE ELIMINAR 20210300")
    maximo = arbol.maximo()
    if maximo:
        imprimir_tabla([maximo], "ESTUDIANTE CON MAYOR CODIGO")
    print("\nRango de codigos [20210400, 20210700]:")
    imprimir_tabla(arbol.buscar_rango_codigo(20210400, 20210700), "BUSQUEDA POR RANGO DE CODIGO")


if __name__ == "__main__":
    main()
