import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

interface User {
  id: number;
  uid: string;
  name: string;
  phone: string;
}

interface Contract {
  id: string | number;
  title: string;
  description: string;
  contract_image: string;
  created_at: string;
  updated_at?: string;
  status: string;
  created_by: number;
  user_id: number;
  user?: User;
}

// Mock用户数据
const mockUsers: User[] = [
  {
    id: 1,
    uid: '7446e84a-8f3b-439a-b5c7-1fa621ecdd19',
    name: 'dhy',
    phone: '13541075247',
  },
  {
    id: 2,
    uid: 'user-002',
    name: '张三',
    phone: '13800138000',
  },
];

// Mock合同数据
const mockContracts: Contract[] = [
  {
    id: 1,
    title: '会员健身合同',
    description: '一年期会员健身合同，包含所有健身设施使用权限',
    contract_image: '/static/contracts/sample1.jpg',
    created_at: '2023-01-15T08:30:00Z',
    updated_at: '2023-01-15T08:30:00Z',
    status: 'active',
    created_by: 1,
    user_id: 1,
  },
  {
    id: 2,
    title: '私教服务合同',
    description: '为期三个月的私人教练服务合同，每周两次训练课程',
    contract_image: '/static/contracts/sample2.jpg',
    created_at: '2023-02-20T14:15:00Z',
    updated_at: '2023-02-20T14:15:00Z',
    status: 'active',
    created_by: 1,
    user_id: 1,
  },
  {
    id: 3,
    title: '健身房会员协议',
    description: '半年期健身房会员资格，包含基础设施使用和团体课程',
    contract_image: '/static/contracts/sample3.jpg',
    created_at: '2023-03-05T09:45:00Z',
    updated_at: '2023-03-05T09:45:00Z',
    status: 'active',
    created_by: 2,
    user_id: 2,
  },
];

// 为每个合同添加用户信息
mockContracts.forEach((contract) => {
  contract.user = mockUsers.find((user) => user.id === contract.user_id);
});

export default {
  // Get all contracts
  'GET /api/admin/contracts': (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedContracts = mockContracts.slice(startIndex, endIndex);

    res.send({
      code: 200,
      message: 'success',
      data: {
        total: mockContracts.length,
        contracts: paginatedContracts,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(mockContracts.length / Number(limit)),
      },
      request_id: uuidv4(),
    });
  },

  // Create contract
  'POST /api/admin/contracts': (req: Request, res: Response) => {
    // 从URL参数中获取信息，而不是body
    const { uid, title, description } = req.query as {
      uid: string;
      title: string;
      description: string;
    };

    // 在实际服务器上，文件会被保存，这里我们模拟生成一个文件路径
    const fileName = `${uuidv4()}.jpg`;
    const contract_image = `/static/contracts/${fileName}`;

    if (!uid || !title || !description) {
      return res.status(400).send({
        code: 400,
        message: '参数不完整',
      });
    }

    const user = mockUsers.find((u) => u.uid === uid) || mockUsers[0];

    const newContract: Contract = {
      id: mockContracts.length + 1,
      user_id: user.id,
      title,
      description,
      contract_image,
      created_at: new Date().toISOString(),
      status: 'active',
      created_by: 2,
      user,
    };

    mockContracts.push(newContract);

    res.send({
      code: 200,
      message: 'success',
      data: newContract,
      request_id: uuidv4(),
    });
  },

  // Get user contracts
  'GET /api/admin/contracts/user/:uid': (req: Request, res: Response) => {
    const { uid } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!uid) {
      return res.status(400).send({
        code: 400,
        message: '参数不完整',
      });
    }

    // 根据uid查找用户
    const user = mockUsers.find((u) => u.uid === uid);

    if (!user) {
      return res.send({
        code: 200,
        message: 'success',
        data: {
          total: 0,
          contracts: [],
          page: Number(page),
          limit: Number(limit),
          pages: 0,
        },
        request_id: uuidv4(),
      });
    }

    // 查找用户的合同
    const userContracts = mockContracts.filter((contract) => contract.user_id === user.id);

    // 分页
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedContracts = userContracts.slice(startIndex, endIndex);

    res.send({
      code: 200,
      message: 'success',
      data: {
        total: userContracts.length,
        contracts: paginatedContracts,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(userContracts.length / Number(limit)),
      },
      request_id: uuidv4(),
    });
  },

  // Get contract by ID
  'GET /api/admin/contracts/:contract_id': (req: Request, res: Response) => {
    const { contract_id } = req.params;

    if (!contract_id) {
      return res.status(400).send({
        code: 400,
        message: '参数不完整',
      });
    }

    const contract = mockContracts.find((contract) => String(contract.id) === String(contract_id));

    if (!contract) {
      return res.status(404).send({
        code: 404,
        message: '未找到合同信息',
      });
    }

    res.send({
      code: 200,
      message: 'success',
      data: contract,
      request_id: uuidv4(),
    });
  },

  // Delete contract
  'DELETE /api/admin/contracts/:contract_id': (req: Request, res: Response) => {
    const { contract_id } = req.params;

    if (!contract_id) {
      return res.status(400).send({
        code: 400,
        message: '参数不完整',
      });
    }

    const contractIndex = mockContracts.findIndex(
      (contract) => String(contract.id) === String(contract_id),
    );

    if (contractIndex === -1) {
      return res.status(404).send({
        code: 404,
        message: '未找到合同信息',
      });
    }

    // 从数组中删除合同
    mockContracts.splice(contractIndex, 1);

    res.send({
      code: 200,
      message: 'success',
      data: null,
      request_id: uuidv4(),
    });
  },
};
