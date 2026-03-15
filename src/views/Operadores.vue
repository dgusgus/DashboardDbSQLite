<!-- src/views/Operadores.vue - COMPLETO con funcionalidades migradas del Dashboard -->
<template>
  <div class="space-y-4">
    <!-- Header Integrado -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold flex items-center gap-2">
          <span>👷</span>
          <span>Operadores Electorales</span>
        </h1>
        <p class="text-sm opacity-70 mt-1">
          {{ filteredData.length }} de {{ allOperadores.length }} operadores
          <span class="ml-2 opacity-50">•</span>
          <span class="ml-2">{{ stats.operadores_rurales || 0 }} rurales</span>
          <span class="mx-1">•</span>
          <span>{{ stats.operadores_urbanos || 0 }} urbanos</span>
        </p>
      </div>
      <div class="flex gap-2">
        <button @click="refreshData" class="btn btn-sm btn-ghost gap-2" :disabled="loading">
          <span v-if="loading" class="loading loading-spinner loading-xs"></span>
          <span v-else>🔄</span>
          Actualizar
        </button>
        <button @click="exportFiltered" class="btn btn-sm btn-primary gap-2">
          <span>📤</span>
          Exportar {{ filteredData.length > 0 ? `(${filteredData.length})` : '' }}
        </button>
      </div>
    </div>

    <!-- Panel de Búsqueda y Filtros Integrado -->
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body p-6">
        <!-- Búsqueda Principal -->
        <div class="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
          <!-- Buscador Principal -->
          <div class="flex-1 w-full">
            <label class="label py-0 pb-2">
              <span class="label-text font-semibold">🔍 Búsqueda General</span>
              <span class="label-text-alt text-xs opacity-60">
                {{ searchTerm ? `${filteredData.length} resultados` : 'Escribe para buscar' }}
              </span>
            </label>
            <div class="relative">
              <input v-model="searchTerm" @input="handleSearch" type="text"
                placeholder="Buscar por nombre, CI, grupo, recinto, municipio..."
                class="input input-bordered w-full pr-20 transition-all focus:input-primary"
                :class="searchTerm ? 'input-primary' : ''" />
              <div class="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button v-if="searchTerm" @click="clearSearch" class="btn btn-ghost btn-sm btn-circle"
                  title="Limpiar búsqueda">
                  ✕
                </button>
                <kbd class="kbd kbd-sm opacity-50">⌘K</kbd>
              </div>
            </div>
          </div>

          <!-- Vista Toggle Integrado -->
          <div class="form-control">
            <label class="label py-0 pb-2">
              <span class="label-text font-semibold">👁️ Vista</span>
            </label>
            <div class="join">
              <button @click="viewMode = 'table'" class="btn btn-sm join-item gap-1"
                :class="viewMode === 'table' ? 'btn-primary' : 'btn-ghost'">
                <span>📋</span>
                <span class="hidden sm:inline">Tabla</span>
              </button>
              <button @click="viewMode = 'cards'" class="btn btn-sm join-item gap-1"
                :class="viewMode === 'cards' ? 'btn-primary' : 'btn-ghost'">
                <span>🎴</span>
                <span class="hidden sm:inline">Tarjetas</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Divisor con estadísticas -->
        <div class="divider my-2">
          <div class="flex gap-4 text-xs opacity-60">
            <span>🏫 {{ stats.recinto || 0 }} recintos</span>
            <span>📝 {{ stats.notario || 0 }} notarios</span>
            <span>📋 {{ stats.acta || 0 }} actas</span>
          </div>
        </div>

        <div tabindex="0" class="collapse bg-base-100 border-base-300 border">
          <div class="collapse-title font-semibold">Filtros Avanzados</div>
          <div class="collapse-content text-sm">
            <!-- Filtros en Línea -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <!-- Filtro Tipo -->
              <div class="form-control">
                <label class="label py-0 pb-1">
                  <span class="label-text text-xs font-medium">Tipo</span>
                  <span v-if="filters.tipo" class="label-text-alt">
                    <button @click="filters.tipo = ''" class="btn btn-ghost btn-xs">✕</button>
                  </span>
                </label>
                <select v-model="filters.tipo" class="select select-bordered select-sm w-full"
                  :class="filters.tipo ? 'select-primary' : ''">
                  <option value="">Todos</option>
                  <option value="rural">🌾 Rural</option>
                  <option value="urbano">🏙️ Urbano</option>
                </select>
              </div>

              <!-- Filtro Provincia -->
              <div class="form-control">
                <label class="label py-0 pb-1">
                  <span class="label-text text-xs font-medium">Provincia</span>
                  <span v-if="filters.provincia" class="label-text-alt">
                    <button @click="filters.provincia = ''" class="btn btn-ghost btn-xs">✕</button>
                  </span>
                </label>
                <select v-model="filters.provincia" class="select select-bordered select-sm w-full"
                  :class="filters.provincia ? 'select-primary' : ''">
                  <option value="">Todas</option>
                  <option v-for="prov in provincias" :key="prov" :value="prov">
                    {{ prov }}
                  </option>
                </select>
              </div>

              <!-- Filtro Municipio -->
              <div class="form-control">
                <label class="label py-0 pb-1">
                  <span class="label-text text-xs font-medium">Municipio</span>
                  <span v-if="filters.municipio" class="label-text-alt">
                    <button @click="filters.municipio = ''" class="btn btn-ghost btn-xs">✕</button>
                  </span>
                </label>
                <select v-model="filters.municipio" class="select select-bordered select-sm w-full"
                  :class="filters.municipio ? 'select-primary' : ''">
                  <option value="">Todos</option>
                  <option v-for="mun in municipios" :key="mun" :value="mun">
                    {{ mun }}
                  </option>
                </select>
              </div>

              <!-- Filtro Asiento Electoral -->
              <div class="form-control">
                <label class="label py-0 pb-1">
                  <span class="label-text text-xs font-medium">Asiento Electoral</span>
                  <span v-if="filters.asiento_electoral" class="label-text-alt">
                    <button @click="filters.asiento_electoral = ''" class="btn btn-ghost btn-xs">✕</button>
                  </span>
                </label>
                <select v-model="filters.asiento_electoral" class="select select-bordered select-sm w-full"
                  :class="filters.asiento_electoral ? 'select-primary' : ''">
                  <option value="">Todos</option>
                  <option v-for="asiento in asientosElectorales" :key="asiento" :value="asiento">
                    {{ asiento }}
                  </option>
                </select>
              </div>

              <!-- Filtro Recinto -->
              <div class="form-control">
                <label class="label py-0 pb-1">
                  <span class="label-text text-xs font-medium">Recinto</span>
                  <span v-if="filters.recinto" class="label-text-alt">
                    <button @click="filters.recinto = ''" class="btn btn-ghost btn-xs">✕</button>
                  </span>
                </label>
                <select v-model="filters.recinto" class="select select-bordered select-sm w-full"
                  :class="filters.recinto ? 'select-primary' : ''">
                  <option value="">Todos</option>
                  <option v-for="rec in recintos" :key="rec" :value="rec">
                    {{ rec }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Filtros Activos Badge -->
        <div v-if="activeFiltersCount > 0 || searchTerm" class="flex flex-wrap gap-2 mt-3">
          <div class="text-xs opacity-60 flex items-center">Filtros activos:</div>
          <div v-if="searchTerm" class="badge badge-primary badge-sm gap-1">
            🔍 "{{ searchTerm.slice(0, 20) }}{{ searchTerm.length > 20 ? '...' : '' }}"
            <button @click="searchTerm = ''" class="hover:text-error">✕</button>
          </div>
          <div v-if="filters.tipo" class="badge badge-primary badge-sm gap-1">
            {{ filters.tipo === 'rural' ? '🌾' : '🏙️' }} {{ filters.tipo }}
            <button @click="filters.tipo = ''" class="hover:text-error">✕</button>
          </div>
          <div v-if="filters.provincia" class="badge badge-primary badge-sm gap-1">
            🗺️ {{ filters.provincia }}
            <button @click="filters.provincia = ''" class="hover:text-error">✕</button>
          </div>
          <div v-if="filters.municipio" class="badge badge-primary badge-sm gap-1">
            🏙️ {{ filters.municipio }}
            <button @click="filters.municipio = ''" class="hover:text-error">✕</button>
          </div>
          <div v-if="filters.asiento_electoral" class="badge badge-primary badge-sm gap-1">
            🗳️ {{ filters.asiento_electoral }}
            <button @click="filters.asiento_electoral = ''" class="hover:text-error">✕</button>
          </div>
          <div v-if="filters.recinto" class="badge badge-primary badge-sm gap-1">
            🏫 {{ filters.recinto }}
            <button @click="filters.recinto = ''" class="hover:text-error">✕</button>
          </div>
          <button @click="clearAllFilters" class="btn btn-ghost btn-xs gap-1">
            🔄 Limpiar todo
          </button>
        </div>
      </div>
    </div>

    <!-- Barra de Herramientas -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-2">
      <div class="flex items-center gap-3">
        <span class="text-sm font-medium">
          Mostrando
          <span class="font-bold text-primary">{{ startRecord }}-{{ endRecord }}</span>
          de
          <span class="font-bold">{{ filteredData.length }}</span>
        </span>
        <div class="badge badge-ghost badge-sm" v-if="filteredData.length !== allOperadores.length">
          Filtrado de {{ allOperadores.length }}
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs opacity-60">Por página:</span>
        <select v-model="pageSize" class="select select-bordered select-xs">
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </div>
    </div>

    <!-- Vista de Tabla -->
    <div v-show="viewMode === 'table'" class="card bg-base-100 shadow-lg">
      <div class="overflow-x-auto">
        <table class="table table-sm">
          <thead class="bg-base-200 sticky top-0 z-10">
            <tr>
              <th @click="sortBy('nombre')" class="cursor-pointer hover:bg-base-300 transition-colors">
                <div class="flex items-center gap-1">
                  👤 Nombre
                  <span v-if="sortColumn === 'nombre'" class="text-primary">
                    {{ sortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </div>
              </th>
              <th>📱 Contacto</th>
              <th @click="sortBy('tipo_operador')" class="cursor-pointer hover:bg-base-300 transition-colors">
                <div class="flex items-center gap-1">
                  🏷️ Tipo
                  <span v-if="sortColumn === 'tipo_operador'" class="text-primary">
                    {{ sortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </div>
              </th>
              <th>👥 Organización</th>
              <th>🏫 Ubicación</th>
              <th>📍 Lugar</th>
              <th class="text-center">⚡ Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedData.length === 0">
              <td colspan="7" class="text-center py-12">
                <div class="flex flex-col items-center gap-2">
                  <div class="text-5xl opacity-20">🔍</div>
                  <div class="text-lg font-semibold opacity-50">No se encontraron resultados</div>
                  <p class="text-sm opacity-40">Intenta ajustar los filtros o búsqueda</p>
                  <button @click="clearAllFilters" class="btn btn-sm btn-ghost mt-2">
                    Limpiar filtros
                  </button>
                </div>
              </td>
            </tr>
            <tr v-for="item in paginatedData" :key="item.id" class="hover:bg-base-200 transition-colors cursor-pointer"
              @click="viewDetails(item)">
              <td>
                <div class="flex flex-col">
                  <span class="font-semibold text-sm">{{ item.nombre }}</span>
                  <span class="text-xs opacity-60">CI: {{ item.cedula }}</span>
                </div>
              </td>
              <td>
                <div class="flex flex-col text-xs">
                  <span v-if="item.telefono" class="font-mono">📱 {{ item.telefono }}</span>
                  <span v-else class="opacity-40">Sin teléfono</span>
                  <span v-if="item.correo" class="opacity-60 truncate max-w-[150px]">✉️ {{ item.correo }}</span>
                </div>
              </td>
              <td>
                <span class="badge badge-sm gap-1"
                  :class="item.tipo_operador === 'rural' ? 'badge-warning' : 'badge-info'">
                  {{ item.tipo_operador === 'rural' ? '🌾' : '🏙️' }}
                  {{ item.tipo_operador }}
                </span>
              </td>
              <td>
                <div class="flex flex-col text-xs">
                  <span class="font-medium">{{ item.grupo || '-' }}</span>
                  <span class="opacity-60">{{ item.coordinador || 'Sin coordinador' }}</span>
                </div>
              </td>
              <td>
                <div class="text-xs">
                  <div class="font-medium">{{ item.recinto || 'Sin recinto' }}</div>
                  <div class="opacity-60">{{ item.asiento_electoral || '-' }}</div>
                </div>
              </td>
              <td>
                <div class="text-xs">
                  <div>{{ item.municipio }}</div>
                  <div class="opacity-60">{{ item.departamento }}</div>
                </div>
              </td>
              <td>
                <div class="flex justify-center gap-1" @click.stop>
                  <button @click="viewDetails(item)" class="btn btn-ghost btn-xs" title="Ver detalles">
                    👁️
                  </button>
                  <button @click="copyToClipboard(item)" class="btn btn-ghost btn-xs" title="Copiar información">
                    📋
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Vista de Tarjetas -->
    <div v-show="viewMode === 'cards'">
      <div v-if="paginatedData.length === 0" class="card bg-base-100 shadow-lg">
        <div class="card-body text-center py-12">
          <div class="text-5xl opacity-20 mb-2">🔍</div>
          <div class="text-lg font-semibold opacity-50">No se encontraron resultados</div>
          <p class="text-sm opacity-40 mt-1">Intenta ajustar los filtros o búsqueda</p>
          <button @click="clearAllFilters" class="btn btn-sm btn-ghost mt-4">
            Limpiar filtros
          </button>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="item in paginatedData" :key="item.id"
          class="card bg-base-100 shadow-md hover:shadow-xl transition-all cursor-pointer border border-base-300 hover:border-primary"
          @click="viewDetails(item)">
          <div class="card-body p-4">
            <!-- Header -->
            <div class="flex justify-between items-start mb-2">
              <div class="flex-1">
                <h3 class="font-bold text-sm leading-tight">{{ item.nombre }}</h3>
                <p class="text-xs opacity-60 mt-0.5">CI: {{ item.cedula }}</p>
              </div>
              <span class="badge badge-sm" :class="item.tipo_operador === 'rural' ? 'badge-warning' : 'badge-info'">
                {{ item.tipo_operador === 'rural' ? '🌾' : '🏙️' }}
              </span>
            </div>

            <div class="divider my-1"></div>

            <!-- Información -->
            <div class="space-y-1.5 text-xs">
              <div class="flex items-start gap-2">
                <span class="opacity-50 flex-shrink-0">📱</span>
                <span class="flex-1">{{ item.telefono || 'Sin teléfono' }}</span>
              </div>
              <div class="flex items-start gap-2">
                <span class="opacity-50 flex-shrink-0">👥</span>
                <span class="flex-1">{{ item.grupo || 'Sin grupo' }}</span>
              </div>
              <div class="flex items-start gap-2">
                <span class="opacity-50 flex-shrink-0">🏫</span>
                <span class="flex-1">{{ item.recinto || 'Sin recinto' }}</span>
              </div>
              <div class="flex items-start gap-2">
                <span class="opacity-50 flex-shrink-0">📍</span>
                <span class="flex-1">{{ item.municipio }}, {{ item.departamento }}</span>
              </div>
            </div>

            <!-- Footer -->
            <div class="card-actions justify-end mt-3 pt-2 border-t border-base-300">
              <button @click.stop="copyToClipboard(item)" class="btn btn-ghost btn-xs gap-1">
                📋 Copiar
              </button>
              <button @click="viewDetails(item)" class="btn btn-primary btn-xs gap-1">
                👁️ Ver más
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Paginación -->
    <div v-if="totalPages > 1" class="flex justify-center py-4">
      <div class="join">
        <button @click="currentPage = 1" :disabled="currentPage === 1" class="join-item btn btn-sm">
          ««
        </button>
        <button @click="currentPage--" :disabled="currentPage === 1" class="join-item btn btn-sm">
          «
        </button>

        <button class="join-item btn btn-sm btn-active">
          Página {{ currentPage }} de {{ totalPages }}
        </button>

        <button @click="currentPage++" :disabled="currentPage === totalPages" class="join-item btn btn-sm">
          »
        </button>
        <button @click="currentPage = totalPages" :disabled="currentPage === totalPages" class="join-item btn btn-sm">
          »»
        </button>
      </div>
    </div>








<!-- Modal de Detalles OPTIMIZADO PARA MÓVIL -->
<dialog ref="detailsModal" class="modal">
  <div class="modal-box max-w-4xl w-full max-h-[95vh] p-0 overflow-hidden">
    
    <!-- Header fijo con degradado moderno -->
    <div class="sticky top-0 z-10 bg-gradient-to-r from-primary to-secondary text-primary-content p-4 shadow-lg">
      <div class="flex items-center justify-between">
        <h3 class="font-bold text-lg sm:text-xl flex items-center gap-2">
          <span class="text-2xl">📋</span>
          <span class="hidden sm:inline">Información Completa</span>
          <span class="sm:hidden">Detalles</span>
        </h3>
        <form method="dialog">
          <button class="btn btn-circle btn-ghost btn-sm hover:bg-white/20 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </form>
      </div>
    </div>

    <!-- Contenido scrolleable -->
    <div v-if="selectedItem" class="overflow-y-auto max-h-[calc(95vh-140px)] p-4 space-y-3">
      
      <!-- Info Personal -->
      <div class="card bg-base-200 shadow-sm">
        <div class="card-body p-3 sm:p-4">
          <h4 class="font-semibold text-sm mb-2 flex items-center gap-2 text-primary">
            <span>👤</span>
            <span>Datos Personales</span>
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div class="flex flex-col">
              <div class="text-xs opacity-60 mb-1">Nombre completo</div>
              <div class="font-semibold truncate">{{ selectedItem.nombre }}</div>
            </div>
            <div class="flex flex-col">
              <div class="text-xs opacity-60 mb-1">CI</div>
              <div class="font-mono text-sm">{{ selectedItem.cedula }} {{ selectedItem.expedido }}</div>
            </div>
            <div class="flex flex-col">
              <div class="text-xs opacity-60 mb-1">Teléfono</div>
              <a :href="'tel:' + selectedItem.telefono" 
                 class="font-mono text-sm link link-primary">
                {{ selectedItem.telefono || 'No registrado' }}
              </a>
            </div>
            <div class="flex flex-col">
              <div class="text-xs opacity-60 mb-1">Correo</div>
              <a :href="'mailto:' + selectedItem.correo" 
                 class="text-xs truncate link link-primary">
                {{ selectedItem.correo || 'No registrado' }}
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Info Organizacional -->
      <div class="card bg-base-200 shadow-sm">
        <div class="card-body p-3 sm:p-4">
          <h4 class="font-semibold text-sm mb-2 flex items-center gap-2 text-secondary">
            <span>🏢</span>
            <span>Organización</span>
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div class="flex items-center justify-between sm:flex-col sm:items-start">
              <div class="text-xs opacity-60 mb-1">Tipo</div>
              <span class="badge badge-lg" :class="selectedItem.tipo_operador === 'rural' ? 'badge-warning' : 'badge-info'">
                {{ selectedItem.tipo_operador === 'rural' ? '🌾 Rural' : '🏙️ Urbano' }}
              </span>
            </div>
            <div class="flex flex-col">
              <div class="text-xs opacity-60 mb-1">Cargo</div>
              <div class="truncate">{{ selectedItem.cargo || 'Operador' }}</div>
            </div>
            <div class="flex flex-col">
              <div class="text-xs opacity-60 mb-1">Grupo</div>
              <div class="truncate">{{ selectedItem.grupo || 'No asignado' }}</div>
            </div>
            <div class="flex flex-col">
              <div class="text-xs opacity-60 mb-1">Coordinador</div>
              <div class="truncate">{{ selectedItem.coordinador || 'No asignado' }}</div>
            </div>
            <div class="flex flex-col sm:col-span-2">
              <div class="text-xs opacity-60 mb-1">Jefe</div>
              <div class="truncate">{{ selectedItem.jefe || 'No asignado' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Info Ubicación -->
      <div class="card bg-base-200 shadow-sm">
        <div class="card-body p-3 sm:p-4">
          <h4 class="font-semibold text-sm mb-2 flex items-center gap-2 text-accent">
            <span>📍</span>
            <span>Ubicación de Trabajo</span>
          </h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between items-start gap-2">
              <span class="opacity-60 text-xs flex-shrink-0">Recinto:</span>
              <span class="font-medium text-right">{{ selectedItem.recinto || 'No asignado' }}</span>
            </div>
            <div class="flex justify-between items-start gap-2">
              <span class="opacity-60 text-xs flex-shrink-0">Asiento:</span>
              <span class="text-right text-xs">{{ selectedItem.asiento_electoral || 'N/A' }}</span>
            </div>
            <div class="divider my-1"></div>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div class="opacity-60 mb-1">Municipio</div>
                <div class="font-medium">{{ selectedItem.municipio }}</div>
              </div>
              <div>
                <div class="opacity-60 mb-1">Provincia</div>
                <div>{{ selectedItem.provincia }}</div>
              </div>
            </div>
            <div class="text-center pt-2">
              <div class="badge badge-outline badge-lg">
                📍 {{ selectedItem.departamento }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actas Asignadas -->
      <div class="card bg-base-200 shadow-sm">
        <div class="card-body p-3 sm:p-4">
          <div class="flex justify-between items-center mb-2">
            <h4 class="font-semibold text-sm flex items-center gap-2 text-success">
              <span>📋</span>
              <span>Actas Asignadas</span>
            </h4>
            <div class="badge badge-success badge-sm">
              {{ operadorActas.length }}
            </div>
          </div>

          <!-- Loading state -->
          <div v-if="loadingActas" class="flex flex-col items-center justify-center py-6">
            <span class="loading loading-spinner loading-md text-primary"></span>
            <span class="mt-2 text-xs opacity-60">Cargando actas...</span>
          </div>

          <!-- Empty state -->
          <div v-else-if="operadorActas.length === 0" class="text-center py-6">
            <div class="text-4xl mb-2 opacity-40">📄</div>
            <div class="text-sm opacity-60">Sin actas registradas</div>
          </div>

          <!-- Lista de actas (optimizada para móvil) -->
          <div v-else class="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-primary scrollbar-track-base-300">
            <div v-for="acta in operadorActas" :key="acta.id"
              class="flex items-center gap-2 p-2 bg-base-100 rounded-lg hover:bg-base-300 transition-colors">
              <span class="text-primary text-lg">📄</span>
              <span class="badge badge-primary flex-1 justify-start font-mono text-xs sm:text-sm">
                {{ acta.codigo }}
              </span>
              <button @click="copyActaCode(acta.codigo)" 
                class="btn btn-circle btn-ghost btn-xs"
                title="Copiar código">
                📋
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Footer fijo con acciones -->
    <div class="sticky bottom-0 bg-base-100 border-t border-base-300 p-3 sm:p-4">
      <div class="flex flex-col sm:flex-row gap-2 sm:justify-end">
        <button @click="copyToClipboard(selectedItem)" 
          class="btn btn-sm sm:btn-md btn-outline gap-2 w-full sm:w-auto">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span class="hidden sm:inline">Copiar información</span>
          <span class="sm:hidden">Copiar</span>
        </button>
        <button @click="exportOperadorCompleto(selectedItem)" 
          class="btn btn-sm sm:btn-md btn-primary gap-2 w-full sm:w-auto">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span class="hidden sm:inline">Exportar completo</span>
          <span class="sm:hidden">Exportar</span>
        </button>
      </div>
    </div>

  </div>
  
  <!-- Backdrop con animación -->
  <form method="dialog" class="modal-backdrop backdrop-blur-sm bg-black/50">
    <button>cerrar</button>
  </form>
</dialog>







  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useDatabase } from '@/composables/useDatabase.js'
import { queries } from '@/utils/queries.js'

const { query, getStats, reload } = useDatabase()

// Estado
const allOperadores = ref([])
const loading = ref(false)
const searchTerm = ref('')
const viewMode = ref('table')
const currentPage = ref(1)
const pageSize = ref(25)
const sortColumn = ref('')
const sortDirection = ref('asc')
const selectedItem = ref(null)
const detailsModal = ref(null)

// Filtros
const filters = ref({
  tipo: '',
  provincia: '',
  municipio: '',
  asiento_electoral: '',
  recinto: '',
})



// Stats
const stats = computed(() => getStats())

// Computed para listas de filtros
const provincias = computed(() => {
  const provs = new Set(allOperadores.value.map(op => op.provincia).filter(Boolean))
  return Array.from(provs).sort()
})

const municipios = computed(() => {
  const muns = new Set(allOperadores.value.map(op => op.municipio).filter(Boolean))
  return Array.from(muns).sort()
})

const asientosElectorales = computed(() => {
  const asientos = new Set(allOperadores.value.map(op => op.asiento_electoral).filter(Boolean))
  return Array.from(asientos).sort()
})

const recintos = computed(() => {
  const recs = new Set(allOperadores.value.map(op => op.recinto).filter(Boolean))
  return Array.from(recs).sort()
})

const activeFiltersCount = computed(() => {
  return Object.values(filters.value).filter(v => v !== '').length
})

const filteredData = computed(() => {
  let data = allOperadores.value

  // Búsqueda global
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    data = data.filter(item =>
      item.nombre?.toLowerCase().includes(term) ||
      item.cedula?.includes(term) ||
      item.grupo?.toLowerCase().includes(term) ||
      item.recinto?.toLowerCase().includes(term) ||
      item.coordinador?.toLowerCase().includes(term) ||
      item.municipio?.toLowerCase().includes(term) ||
      item.departamento?.toLowerCase().includes(term)
    )
  }

  // Filtros
  if (filters.value.tipo) {
    data = data.filter(item => item.tipo_operador === filters.value.tipo)
  }
  if (filters.value.provincia) {
    data = data.filter(item => item.provincia === filters.value.provincia)
  }
  if (filters.value.municipio) {
    data = data.filter(item => item.municipio === filters.value.municipio)
  }
  if (filters.value.asiento_electoral) {
    data = data.filter(item => item.asiento_electoral === filters.value.asiento_electoral)
  }
  if (filters.value.recinto) {
    data = data.filter(item => item.recinto === filters.value.recinto)
  }

  // Ordenamiento
  if (sortColumn.value) {
    data = [...data].sort((a, b) => {
      const aVal = a[sortColumn.value] || ''
      const bVal = b[sortColumn.value] || ''
      const comparison = aVal.toString().localeCompare(bVal.toString())
      return sortDirection.value === 'asc' ? comparison : -comparison
    })
  }

  return data
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / pageSize.value))

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

const startRecord = computed(() => {
  if (filteredData.value.length === 0) return 0
  return (currentPage.value - 1) * pageSize.value + 1
})

const endRecord = computed(() => {
  const end = currentPage.value * pageSize.value
  return end > filteredData.value.length ? filteredData.value.length : end
})

// Métodos
const loadOperadores = async () => {
  loading.value = true
  try {
    allOperadores.value = query(queries.getAllOperadores())
  } catch (error) {
    console.error('Error cargando operadores:', error)
  } finally {
    loading.value = false
  }
}

const refreshData = async () => {
  loading.value = true
  try {
    await reload()
    await loadOperadores()
  } catch (error) {
    console.error('Error refrescando datos:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
}

const clearSearch = () => {
  searchTerm.value = ''
  currentPage.value = 1
}

const clearAllFilters = () => {
  searchTerm.value = ''
  filters.value = {
    tipo: '',
    provincia: '',
    municipio: '',
    asiento_electoral: '',
    recinto: ''
  }
  currentPage.value = 1
}

const sortBy = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

// 🆕 NUEVO: Estado para actas del operador
const operadorActas = ref([])
const loadingActas = ref(false)

// 🆕 NUEVO: Cargar actas del operador cuando se abre el modal
const viewDetails = async (item) => {
  selectedItem.value = item
  detailsModal.value?.showModal()

  console.log('Operador seleccionado:', item);
  // Cargar actas del recinto del operador
  await loadOperadorActas(item.recinto_id)
  console.log('Actas del operador:', operadorActas.value);
}

// 🆕 NUEVO: Método para cargar actas
const loadOperadorActas = async (recintoId) => {
  if (!recintoId) { operadorActas.value = []; return }
  loadingActas.value = true
  try {
    const actas = query(`
      SELECT a.id, a.codigo
      FROM acta a
      JOIN persona p ON a.persona_id = p.id
      WHERE p.recinto_id = ?
      ORDER BY a.codigo
    `, [recintoId])
    operadorActas.value = actas
  } catch (error) {
    console.error('Error cargando actas:', error)
    operadorActas.value = []
  } finally {
    loadingActas.value = false
  }
}

// 🆕 NUEVO: Copiar código de acta
const copyActaCode = (codigo) => {
  navigator.clipboard.writeText(codigo).then(() => {
    showNotification(`✅ Código copiado: ${codigo}`)
  }).catch(err => {
    console.error('Error copiando código:', err)
  })
}

// 🆕 NUEVO: Ver detalles de acta
const viewActaDetails = (acta) => {
  // Cerrar modal actual
  detailsModal.value?.close()

  // Navegar a vista de actas con búsqueda del código
  router.push({
    path: '/actas',
    query: { search: acta.codigo }
  })
}

// 🆕 NUEVO: Exportar operador con actas
const exportOperadorCompleto = (item) => {
  const data = {
    // Datos personales
    personal: {
      nombre: item.nombre,
      cedula: item.cedula,
      expedido: item.expedido,
      telefono: item.telefono,
      correo: item.correo
    },
    // Organización
    organizacion: {
      tipo: item.tipo_operador,
      cargo: item.cargo,
      grupo: item.grupo,
      coordinador: item.coordinador,
      jefe: item.jefe
    },
    // Ubicación
    ubicacion: {
      recinto: item.recinto,
      asiento_electoral: item.asiento_electoral,
      municipio: item.municipio,
      provincia: item.provincia,
      departamento: item.departamento
    },
    // Actas asignadas
    actas: operadorActas.value.map(a => ({
      id: a.id,
      codigo: a.codigo
    })),
    // Metadata
    metadata: {
      fecha_exportacion: new Date().toISOString(),
      total_actas: operadorActas.value.length
    }
  }

  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `operador_${item.cedula}_completo.json`
  link.click()
  URL.revokeObjectURL(url)

  showNotification(`✅ Exportado: ${item.nombre} (${operadorActas.value.length} actas)`)
}

// Importar router si no está
import { useRouter } from 'vue-router'
const router = useRouter()

const copyToClipboard = (item) => {
  const text = `
INFORMACIÓN DEL OPERADOR
========================

👤 DATOS PERSONALES
Nombre: ${item.nombre}
CI: ${item.cedula} ${item.expedido || ''}
Teléfono: ${item.telefono || 'No registrado'}
Correo: ${item.correo || 'No registrado'}

🏢 ORGANIZACIÓN
Tipo: ${item.tipo_operador}
Cargo: ${item.cargo || 'Operador'}
Grupo: ${item.grupo || 'No asignado'}
Coordinador: ${item.coordinador || 'No asignado'}
Jefe: ${item.jefe || 'No asignado'}

📍 UBICACIÓN
Recinto: ${item.recinto || 'No asignado'}
Asiento Electoral: ${item.asiento_electoral || 'N/A'}
Municipio: ${item.municipio}
Provincia: ${item.provincia}
Departamento: ${item.departamento}
  `.trim()

  navigator.clipboard.writeText(text).then(() => {
    showNotification('✅ Información copiada al portapapeles')
  }).catch(err => {
    console.error('Error copiando:', err)
    alert('❌ Error al copiar la información')
  })
}

const exportSingle = (item) => {
  const data = {
    nombre: item.nombre,
    cedula: item.cedula,
    expedido: item.expedido,
    telefono: item.telefono,
    correo: item.correo,
    tipo: item.tipo_operador,
    cargo: item.cargo,
    grupo: item.grupo,
    coordinador: item.coordinador,
    jefe: item.jefe,
    recinto: item.recinto,
    asiento_electoral: item.asiento_electoral,
    municipio: item.municipio,
    provincia: item.provincia,
    departamento: item.departamento
  }

  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${item.nombre.replace(/\s+/g, '_')}_${item.cedula}.json`
  link.click()
  URL.revokeObjectURL(url)
}

const exportFiltered = () => {
  if (filteredData.value.length === 0) {
    alert('⚠️ No hay datos para exportar')
    return
  }

  const headers = [
    'Nombre', 'CI', 'Expedido', 'Teléfono', 'Correo', 'Tipo', 'Cargo',
    'Grupo', 'Coordinador', 'Jefe', 'Recinto', 'Asiento Electoral',
    'Municipio', 'Provincia', 'Departamento'
  ]

  const rows = filteredData.value.map(item => [
    item.nombre || '', item.cedula || '', item.expedido || '',
    item.telefono || '', item.correo || '', item.tipo_operador || '',
    item.cargo || '', item.grupo || '', item.coordinador || '',
    item.jefe || '', item.recinto || '', item.asiento_electoral || '',
    item.municipio || '', item.provincia || '', item.departamento || ''
  ])

  const escapeCsv = (value) => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(escapeCsv).join(','))
  ].join('\n')

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url

  let filename = 'operadores'
  if (filters.value.tipo) filename += `_${filters.value.tipo}`
  if (filters.value.provincia) filename += `_${filters.value.provincia.replace(/\s+/g, '_')}`
  if (searchTerm.value) filename += '_filtrado'
  filename += `_${new Date().toISOString().split('T')[0]}.csv`

  link.download = filename
  link.click()
  URL.revokeObjectURL(url)

  showNotification(`✅ Exportados ${filteredData.value.length} registros`)
}

const showNotification = (message) => {
  const notification = document.createElement('div')
  notification.className = 'toast toast-top toast-center'
  notification.innerHTML = `<div class="alert alert-success"><span>${message}</span></div>`
  document.body.appendChild(notification)
  setTimeout(() => notification.remove(), 2000)
}

// Keyboard shortcuts
const handleKeyboard = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    document.querySelector('input[type="text"]')?.focus()
  }
  if (e.key === 'Escape' && searchTerm.value) {
    clearSearch()
  }
}

// Watchers
watch([searchTerm, filters], () => {
  currentPage.value = 1
}, { deep: true })

watch(pageSize, () => {
  currentPage.value = 1
})

// Lifecycle
onMounted(() => {
  loadOperadores()
  window.addEventListener('keydown', handleKeyboard)
})
</script>








<style scoped>
.card,
.badge,
.btn {
  transition: all 0.2s ease;
}

tbody tr:hover {
  transform: scale(1.005);
}

.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: oklch(var(--p)) transparent;
}

.table thead {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.input:focus,
.select:focus {
  transform: scale(1.01);
  box-shadow: 0 0 0 3px oklch(var(--p) / 0.1);
}

.toast {
  z-index: 9999;
}


/* Scroll mejorado para lista de actas */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: oklch(var(--p) / 0.3) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: oklch(var(--p) / 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: oklch(var(--p) / 0.5);
}

/* Animación de actas */
.bg-base-100:hover {
  transform: translateX(4px);
  transition: transform 0.2s ease;
}





/* Scrollbar personalizado para navegadores webkit */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: var(--fallback-b3, oklch(var(--b3)));
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: var(--fallback-p, oklch(var(--p)));
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: var(--fallback-pf, oklch(var(--pf)));
}

/* Animación suave para el modal */
dialog.modal[open] .modal-box {
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Mejoras para táctil */
@media (hover: none) and (pointer: coarse) {
  .btn {
    min-height: 44px; /* Área táctil mínima recomendada */
  }
}

/* Optimización para pantallas pequeñas */
@media (max-width: 640px) {
  .modal-box {
    max-width: 100vw;
    width: 100vw;
    max-height: 100vh;
    height: 100vh;
    margin: 0;
    border-radius: 0;
  }
}
</style>