const { StatusCodes } = require('http-status-codes');
const Address = require('../models/address');
const TreatmentPlace = require('../models/treatment-place');

const addresses = [
	{
		name: 'Cần Thơ',
		districts: [
			{
				name: 'Ninh Kiều',
				wards: [
					{
						name: 'Tân An'
					},
					{
						name: 'Cái Khế'
					},
					{
						name: 'An Hòa'
					},
					{
						name: 'An Cư'
					},
					{
						name: 'An Hội'
					}
				]
			},
			{
				name: 'Cờ Đỏ',
				wards: [
					{
						name: 'Đông Hiệp'
					},
					{
						name: 'Đông Thắng'
					},
					{
						name: 'Thạnh Phú'
					},
					{
						name: 'Thới Đông'
					},
					{
						name: 'Thới Hưng'
					}
				]
			},
			{
				name: 'Cái Răng',
				wards: [
					{
						name: 'Lê Bình'
					},
					{
						name: 'Thường Thạnh'
					},
					{
						name: 'Phú Thứ'
					},
					{
						name: 'Tân Phú'
					},
					{
						name: 'Hưng Phú'
					}
				]
			},
			{
				name: 'Bình Thủy',
				wards: [
					{
						name: 'An Thới'
					},
					{
						name: 'Bình Thủy'
					},
					{
						name: 'Bùi Hữu Nghĩa'
					},
					{
						name: 'Long Hòa'
					},
					{
						name: 'Long Tuyền'
					}
				]
			},
			{
				name: 'Ô Môn',
				wards: [
					{
						name: 'Thới Long'
					},
					{
						name: 'Long Hưng'
					},
					{
						name: 'Thới Hòa'
					},
					{
						name: 'Thới An'
					},
					{
						name: 'Châu Văn Liêm'
					}
				]
			}
		]
	},
	{
		name: 'Hồ Chí Minh',
		districts: [
			{
				name: 'Quận 1',
				wards: [
					{
						name: 'Bến Nghé'
					},
					{
						name: 'Bến Thành'
					},
					{
						name: 'Cô Giang'
					},
					{
						name: 'Cầu Kho'
					},
					{
						name: 'Đa Kao'
					}
				]
			},
			{
				name: 'Quận 2',
				wards: [
					{
						name: 'An Phú'
					},
					{
						name: 'Thảo Điền'
					},
					{
						name: 'An Khánh'
					},
					{
						name: 'Bình Khánh'
					},
					{
						name: 'Bình An'
					}
				]
			},
			{
				name: 'Quận 3',
				wards: [
					{
						name: 'phường 1'
					},
					{
						name: 'phường 2'
					},
					{
						name: 'phường 3'
					},
					{
						name: 'phường 4'
					},
					{
						name: 'phường 5'
					}
				]
			},
			{
				name: 'Quận 8',
				wards: [
					{
						name: 'phường 1'
					},
					{
						name: 'phường 2'
					},
					{
						name: 'phường 3'
					},
					{
						name: 'phường 4'
					},
					{
						name: 'phường 5'
					}
				]
			},
			{
				name: 'Quận 10',
				wards: [
					{
						name: 'phường 1'
					},
					{
						name: 'phường 2'
					},
					{
						name: 'phường 3'
					},
					{
						name: 'phường 4'
					},
					{
						name: 'phường 5'
					}
				]
			}
		]
	},
	{
		name: 'Kiên Giang',
		districts: [
			{
				name: 'Kiên Lương',
				wards: [
					{
						name: 'Vĩnh Điều'
					},
					{
						name: 'Vĩnh Phú'
					},
					{
						name: 'Sơn Hải'
					},
					{
						name: 'Dương Hòa'
					},
					{
						name: 'Hòa Điền'
					}
				]
			},
			{
				name: 'Hòn Đất',
				wards: [
					{
						name: 'Bình Sơn'
					},
					{
						name: 'Bình Giang'
					},
					{
						name: 'Sơn Bình'
					},
					{
						name: 'Mỹ Phước'
					},
					{
						name: 'Nam Thái Sơn'
					}
				]
			},
			{
				name: 'Tân Hiệp',
				wards: [
					{
						name: 'Tân An'
					},
					{
						name: 'Tân Hiệp A'
					},
					{
						name: 'Tân Hiệp B'
					},
					{
						name: 'Tân Hòa'
					},
					{
						name: 'Tân Hội'
					}
				]
			},
			{
				name: 'Châu Thành',
				wards: [
					{
						name: 'Bình An'
					},
					{
						name: 'Giục Tượng'
					},
					{
						name: 'Mong Thọ'
					},
					{
						name: 'Mong Thọ A'
					},
					{
						name: 'Mong Thọ B'
					}
				]
			},
			{
				name: 'Giồng Riềng',
				wards: [
					{
						name: 'Bàn Tân Định'
					},
					{
						name: 'Bàn Thạch'
					},
					{
						name: 'Hòa An'
					},
					{
						name: 'Hòa Hưng'
					},
					{
						name: 'Hòa Lợi'
					}
				]
			}
		]
	},
	{
		name: 'An Giang',
		districts: [
			{
				name: 'An Phú',
				wards: [
					{
						name: 'Đa Phước'
					},
					{
						name: 'Khánh An'
					},
					{
						name: 'Khánh Bình'
					},
					{
						name: 'Nhơn Hội'
					},
					{
						name: 'Phú Hội'
					}
				]
			},
			{
				name: 'Tịnh Biên',
				wards: [
					{
						name: 'An Hảo'
					},
					{
						name: 'An Cư'
					},
					{
						name: 'An Nông'
					},
					{
						name: 'Tân Lợi'
					},
					{
						name: 'Núi Voi'
					}
				]
			},
			{
				name: 'Tri Tôn',
				wards: [
					{
						name: 'Lạc Quới'
					},
					{
						name: 'Lê Trì'
					},
					{
						name: 'Vĩnh Gia'
					},
					{
						name: 'Vĩnh Phước'
					},
					{
						name: 'Châu Lăng'
					}
				]
			},
			{
				name: 'Châu Phú',
				wards: [
					{
						name: 'Bình Mỹ'
					},
					{
						name: 'Bình Long'
					},
					{
						name: 'Bình Chánh'
					},
					{
						name: 'Bình Thủy'
					},
					{
						name: 'Bình Phú '
					}
				]
			},
			{
				name: 'Châu Thành',
				wards: [
					{
						name: 'An Hòa'
					},
					{
						name: 'Bình Hòa'
					},
					{
						name: 'Cần Đăng'
					},
					{
						name: 'Tân Phú'
					},
					{
						name: 'Vĩnh An'
					}
				]
			}
		]
	},
	{
		name: 'Hải Phòng',
		districts: [
			{
				name: 'Hồng Bàng',
				wards: [
					{
						name: 'Minh Khai'
					},
					{
						name: 'Hoàng Văn Thụ'
					},
					{
						name: 'Quang Trung'
					},
					{
						name: 'Phan Bội Châu'
					},
					{
						name: 'Phạm Hồng Thái'
					}
				]
			},
			{
				name: 'Lê Chân',
				wards: [
					{
						name: 'An Biên'
					},
					{
						name: 'An Dương'
					},
					{
						name: 'Cát Dài'
					},
					{
						name: 'Dư Hàng'
					},
					{
						name: 'Đông Hải'
					}
				]
			},
			{
				name: 'Ngô Quyền',
				wards: [
					{
						name: 'Cầu Đất'
					},
					{
						name: 'Cầu Tre'
					},
					{
						name: 'Đằng Giang'
					},
					{
						name: 'Đông Khê'
					},
					{
						name: 'Gia Viên'
					}
				]
			},
			{
				name: 'Kiến An',
				wards: [
					{
						name: 'Bắc Sơn'
					},
					{
						name: 'Đồng Hòa'
					},
					{
						name: 'Lãm Hòa'
					},
					{
						name: 'Nam Sơn'
					},
					{
						name: 'Ngọc Sơn'
					}
				]
			},
			{
				name: 'Đồ Sơn',
				wards: [
					{
						name: 'Bàng La'
					},
					{
						name: 'Hải Sơn'
					},
					{
						name: 'Hợp Đức'
					},
					{
						name: 'Minh Đức'
					},
					{
						name: 'Vạn Hương'
					}
				]
			}
		]
	}
];

const treatmentPlaces = [
	{
		name: 'Bệnh viện đa khoa thành phố',
		capacity: 300,
		currentPatients: 0
	},
	{
		name: 'Bệnh viện 30/4',
		capacity: 200,
		currentPatients: 0
	},
	{
		name: 'Bệnh viện Nhiệt Đới',
		capacity: 150,
		currentPatients: 0
	},
	{
		name: 'Bệnh viện Nguyễn Trãi',
		capacity: 180,
		currentPatients: 0
	},
	{
		name: 'Bệnh viện Phạm Ngọc Thạch',
		capacity: 230,
		currentPatients: 0
	}
];

const initializeDB = async () => {
	try {
		// initialize addresses
		const addressList = await Address.find({});
		if (addressList.length === 0) {
			await Address.insertMany(addresses);
		}
		// initialize places of treatment
		const treatmentPlaceList = await TreatmentPlace.find({});
		if (treatmentPlaceList.length === 0) {
			await TreatmentPlace.insertMany(treatmentPlaces);
		}
		console.log('Data has been initialized!');
	} catch (err) {
		res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ msg: 'Internal Server Error' });
	}
};

module.exports = initializeDB;
