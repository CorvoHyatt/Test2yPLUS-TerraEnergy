<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $query = Sale::with('user');

        if ($request->has('start_date')) {
            $query->where('sale_date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->where('sale_date', '<=', $request->end_date);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $sales = $query->orderBy('sale_date', 'asc')->get();

        // Preparar datos de ventas por usuario para totales
        // Si hay un filtro de usuario, incluimos solo información de ese usuario
        if ($request->has('user_id')) {
            $salesByUser = [];
            if ($sales->count() > 0) {
                $user = $sales->first()->user;
                $salesByUser[] = [
                    'user' => $user->id . ' - ' . $user->name,
                    'total' => $sales->sum('total_amount')
                ];
            }
        } else {
            // Si no hay filtro, incluimos todos los usuarios que tienen ventas
            $salesByUser = $sales->groupBy('user_id')
                ->map(function($group) {
                    $user = $group->first()->user;
                    return [
                        'user' => $user->id . ' - ' . $user->name,
                        'total' => $group->sum('total_amount')
                    ];
                })
                ->values()
                ->toArray();
        }

        $totals = [
            'total_sales' => $sales->sum('total_amount'),
            'sales_by_client' => $sales->groupBy('client')
                ->map(fn($group) => $group->sum('total_amount'))
                ->toArray(),
            'sales_by_user' => $salesByUser
        ];

        return response()->json([
            'sales' => $sales,
            'totals' => $totals
        ]);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'client' => 'required|string|max:255',
            'total_amount' => 'required|numeric|min:0',
            'sale_date' => 'required|date',
            'user_id' => 'required|exists:users,id'
        ]);

        $sale = Sale::create($validatedData);
        $sale->load('user');

        return response()->json($sale, 201);
    }

    public function update(Request $request, Sale $sale)
    {
        $validatedData = $request->validate([
            'client' => 'sometimes|required|string|max:255',
            'total_amount' => 'sometimes|required|numeric|min:0',
            'sale_date' => 'sometimes|required|date',
            'user_id' => 'sometimes|required|exists:users,id'
        ]);

        $sale->update($validatedData);
        $sale->load('user');

        return response()->json($sale);
    }

    public function destroy(Sale $sale)
    {
        $sale->delete();
        return response()->json(null, 204);
    }
}